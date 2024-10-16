package org.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Hooks;

@SpringBootApplication
@Slf4j
public class App {
  public static void main(String[] args) {
    App.configureReactiveXErrorHandling();
    SpringApplication.run(App.class, args);
  }

  public static void configureReactiveXErrorHandling() {
    // Log all errors thrown within Reactor operators
    Hooks.onOperatorError((throwable, reference) -> {
      log.info("onOperatorError");
      log.error("Reactor error: %s".formatted(throwable.getMessage()), throwable);

      return null;
    });
  }
}
