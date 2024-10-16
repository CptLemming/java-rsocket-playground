package org.example;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.example.api.protobuf.eq.BandIdent;
import org.example.api.protobuf.eq.BandRequest;
import org.example.api.protobuf.eq.BandResponse;
import org.example.api.protobuf.eq.BandsRequest;
import org.example.api.protobuf.eq.BandsResponse;
import org.example.api.protobuf.eq.EqBands;
import org.example.api.protobuf.mutation.MutationResult;

import io.netty.buffer.ByteBuf;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
import reactor.core.publisher.Sinks.EmitFailureHandler;
import reactor.core.publisher.Sinks.Many;

@Slf4j
public class EqBandsImpl implements EqBands {

  private final List<BandResponse> bands;
  private final Many<List<BandResponse>> stream;

  public EqBandsImpl() {
    this.bands = IntStream.range(0, 6)
        .mapToObj(index -> BandResponse.newBuilder().setIndex(index).setGain(index * 10).build())
        .collect(Collectors.toList());
    this.stream = Sinks.many().multicast().directBestEffort();

    log.info("EqBands : {}", this.bands.size());
  }

  @Override
  public Flux<BandsResponse> getBands(BandsRequest message, ByteBuf metadata) {
    log.info("Get bands({})", this.bands.size());

    return Flux.just(BandsResponse.newBuilder().addAllBands(bands).build())
        .concatWith(
            this.stream.asFlux()
                .map(items -> BandsResponse.newBuilder().addAllBands(items).build()))
                // .onBackpressureError(); // <-- This will stop the stream on backpressure errors
                .onBackpressureLatest();   // <-- Whereas this will drop all but the latest messages
  }

  @Override
  public Flux<BandResponse> getBand(BandRequest message, ByteBuf metadata) {
    log.info("Get band({})", message.getBand());

    var lookup = this.bands.stream().filter(band -> band.getIndex() == message.getBand()).findFirst();

    if (lookup.isPresent()) {
      return Flux.just(lookup.get())
          .concatWith(this.stream.asFlux().map(items -> items.get(message.getBand())));
    }

    return Flux.error(new Error("NotFound"));
  }

  @Override
  public Mono<MutationResult> updateBand(BandIdent message, ByteBuf metadata) {
    log.info("Update band({}) = {}", message.getIndex(), message.getGain());

    var band = this.bands.get(message.getIndex());
    if (band != null) {
      var next = BandResponse.newBuilder(band).setGain(message.getGain()).build();
      this.bands.set(message.getIndex(), next);

      this.stream.emitNext(this.bands, EmitFailureHandler.FAIL_FAST);
    }

    return Mono.just(MutationResult.newBuilder().setResult("OK").build());
  }
}
