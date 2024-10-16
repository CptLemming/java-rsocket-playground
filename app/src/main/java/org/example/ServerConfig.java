package org.example;

import java.util.Optional;

import org.springframework.boot.rsocket.context.RSocketServerBootstrap;
import org.springframework.boot.rsocket.server.RSocketServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.example.api.protobuf.eq.EqBands;
import org.example.api.protobuf.eq.EqBandsServer;
import io.rsocket.ipc.RequestHandlingRSocket;
import reactor.core.publisher.Mono;

@Configuration
public class ServerConfig {

  @Bean
  EqBands getBands() {
    return new EqBandsImpl();
  }
 
  @Bean
  EqBandsServer eqBandsServer() {
    return new EqBandsServer(getBands(), Optional.empty(), Optional.empty(), Optional.empty());
  }

  @Bean
  public RSocketServerBootstrap rSocketServerBootstrap(RSocketServerFactory factory) {
    return new RSocketServerBootstrap(
      factory,
      (setup, sendingSocket) -> Mono.just(
        new RequestHandlingRSocket()
          .withEndpoint(eqBandsServer())
      )
    );
  }
}
