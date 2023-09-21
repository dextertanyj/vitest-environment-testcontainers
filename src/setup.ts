import { GenericContainer, Wait } from "testcontainers";

import { ContainerConfiguration } from "./types";

export const setup = async (configurations: ContainerConfiguration[]) => {
  const containerTemplates = configurations.map((configuration) => {
    const { name, image, ports = [], environment, wait } = configuration;
    let container = new GenericContainer(image);

    if (ports.length) {
      container = container.withExposedPorts(...ports);
    }

    if (environment) {
      container = container.withEnvironment(environment);
    }

    if (wait) {
      const { type, timeout = 60 * 1000 } = wait;
      switch (type) {
        case "PORT":
          container = container
            .withStartupTimeout(timeout)
            .withWaitStrategy(Wait.forListeningPorts());
          break;
        case "LOG":
          container = container
            .withStartupTimeout(timeout)
            .withWaitStrategy(Wait.forLogMessage(wait.message, wait.times ?? 1));
          break;
        case "HEALTHCHECK":
          container = container.withStartupTimeout(timeout).withWaitStrategy(Wait.forHealthCheck());
          break;
      }
    }

    return {
      name,
      container,
      ports: ports.map((port) => (typeof port === "number" ? port : port.container)),
      configuration,
    };
  });

  const startedContainers = await Promise.all(
    containerTemplates.map(async (containerTemplate) => {
      const { container, ports } = containerTemplate;

      const startedContainer = await container.start();

      const host = startedContainer.getHost();

      const mappedPorts = new Map<number, number>();

      for (const port of ports) {
        mappedPorts.set(port, startedContainer.getMappedPort(port));
      }

      return {
        ...containerTemplate,
        host,
        ports: mappedPorts,
        container: startedContainer,
      };
    }),
  );

  return startedContainers;
};
