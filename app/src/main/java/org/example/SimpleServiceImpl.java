package org.example;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import org.reactivestreams.Publisher;
import com.google.protobuf.Empty;
import io.netty.buffer.ByteBuf;
import io.rsocket.rpc.testing.protobuf.SimpleRequest;
import io.rsocket.rpc.testing.protobuf.SimpleResponse;
import io.rsocket.rpc.testing.protobuf.SimpleService;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public class SimpleServiceImpl implements SimpleService {
  @Override
  public Mono<Empty> fireAndForget(SimpleRequest message, ByteBuf metadata) {
    return Mono.just(Empty.getDefaultInstance());
  }

  @Override
  public Mono<SimpleResponse> requestReply(SimpleRequest message, ByteBuf metadata) {
    String msg = message.getRequestMessage();
    SimpleResponse response = SimpleResponse.newBuilder()
        .setResponseMessage("1 we got requestReply message -> " + msg)
        .build();
    return Mono.just(response);
  }

  @Override
  public Flux<SimpleResponse> requestStream(SimpleRequest message, ByteBuf metadata) {
    String requestMessage = message.getRequestMessage();
    return Flux.interval(Duration.ofMillis(200))
        .onBackpressureDrop()
        .map(i -> String.format("%d - got message - %s", i, requestMessage))
        .map(s -> SimpleResponse.newBuilder()
            .setResponseMessage(s)
            .build());
  }

  @Override
  public Flux<SimpleResponse> streamingRequestAndResponse(Publisher<SimpleRequest> messages, ByteBuf metadata) {
    return Flux.from(messages).flatMap(e -> requestReply(e, metadata));
  }

  @Override
  public Mono<SimpleResponse> streamingRequestSingleResponse(Publisher<SimpleRequest> messages, ByteBuf metadata) {
    return Flux.from(messages)
        .windowTimeout(10, Duration.ofSeconds(500))
        .take(1)
        .flatMap(Function.identity())
        .reduce(new ConcurrentHashMap<Character, AtomicInteger>(), (map, simpleRequest) -> {
          char[] chars = simpleRequest.getRequestMessage()
              .toCharArray();
          for (char ch : chars)
            map.computeIfAbsent(ch, character -> new AtomicInteger())
                .incrementAndGet();
          return map;
        })
        .map(map -> {
          StringBuilder builder = new StringBuilder();
          map.forEach((character, atomicInteger) -> builder.append(
              String.format("character -> %s, count -> %d%n", character, atomicInteger.get())));
          String s = builder.toString();
          return SimpleResponse.newBuilder()
              .setResponseMessage(s)
              .build();
        });
  }
}
