import { GenericContainer, StartedTestContainer, Wait } from "testcontainers";

interface PortWaitStrategy {
  type: "PORT";
}

interface LogWaitStrategy {
  type: "LOG";
  message: string;
  times?: number;
}

interface HealthCheckWaitStrategy {
  type: "HEALTHCHECK";
}

type WaitStrategy = { timeout?: number } & (
  | PortWaitStrategy
  | LogWaitStrategy
  | HealthCheckWaitStrategy
);

export interface ContainerConfiguration {
  name: string;
  image: string;
  ports?: (number | { container: number; host: number })[];
  environment?: Record<string, string>;
  wait?: WaitStrategy;
}

export const setup = async (
  configurations: ContainerConfiguration[],
): Promise<
  readonly {
    name: string;
    container: StartedTestContainer;
    host: string;
    ports: { container: number; host: number }[];
  }[]
> => {
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
    };
  });

  const startedContainers = await Promise.all(
    containerTemplates.map(async (containerTemplate) => {
      const { name, container, ports } = containerTemplate;

      const startedContainer = await container.start();

      const host = startedContainer.getHost();

      const mappedPorts = ports.map((port) => ({
        container: port,
        host: startedContainer.getMappedPort(port),
      }));

      return {
        name,
        container: startedContainer,
        host,
        ports: mappedPorts,
      };
    }),
  );

  return startedContainers;
};
