__module__ = "EventBusRabbitMQ"
__paths__ = ["src/EventBusRabbitMQ/**"]
__depends_on__ = ["EventBus", "Shared"]

class EventBusOptions:
    RetryCount: int
    SubscriptionClientName: string

@static
class RabbitMqDependencyInjectionExtensions:
    @staticmethod
    def AddRabbitMqEventBus(
        builder: 'this IHostApplicationBuilder',
        connectionName: string,
    ) -> IEventBusBuilder: ...

@sealed
class RabbitMQEventBus(IEventBus, IDisposable, IHostedService):
    def Dispose(self) -> void: ...
    def PublishAsync(self, event: IntegrationEvent) -> Task: ...
    def StartAsync(self, cancellationToken: CancellationToken) -> Task: ...
    def StopAsync(self, cancellationToken: CancellationToken) -> Task: ...

class RabbitMQTelemetry:
    ActivitySource: Readonly[ActivitySource]
    ActivitySourceName: ClassVar[string]
    Propagator: Readonly[TextMapPropagator]
