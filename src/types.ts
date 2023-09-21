import type { EnvironmentOptions as EO } from "vitest";

declare global {
  // eslint-disable-next-line no-var
  var testcontainers: { containers: ContainerInformation[] };
}

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

export type ContainerConfigurations = ContainerConfiguration[];

export interface EnvironmentOptions extends EO {
  testcontainers?: {
    containers?: ContainerConfigurations;
  };
}

export interface ContainerInformation {
  name: string;
  host: string;
  ports: Map<number, number>;
  configuration: ContainerConfiguration;
}
