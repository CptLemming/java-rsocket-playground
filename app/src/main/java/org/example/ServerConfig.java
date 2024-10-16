package org.example;

import java.util.Optional;

import org.springframework.boot.rsocket.context.RSocketServerBootstrap;
import org.springframework.boot.rsocket.server.RSocketServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.rsocket.ipc.RequestHandlingRSocket;
import io.rsocket.rpc.testing.protobuf.SimpleServiceServer;
import reactor.core.publisher.Mono;

@Configuration
public class ServerConfig {
  @Bean
  SimpleServiceServer serviceServer() {
    return new SimpleServiceServer(new SimpleServiceImpl(), Optional.empty(), Optional.empty(), Optional.empty());
  }

  @Bean
  public RSocketServerBootstrap rSocketServerBootstrap(RSocketServerFactory factory) {
    // NOTE - This disables the automatic mapping used by MessageController
    return new RSocketServerBootstrap(
      factory,
      (setup, sendingSocket) -> Mono.just(
        new RequestHandlingRSocket()
          .withEndpoint(serviceServer())
      )
    );
  }
}
