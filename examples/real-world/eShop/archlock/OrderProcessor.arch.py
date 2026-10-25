__module__ = "OrderProcessor"
__paths__ = ["src/OrderProcessor/**"]
__depends_on__ = ["eShop.ServiceDefaults", "EventBus", "EventBusRabbitMQ"]

class IGracePeriodOrdersRepository(Protocol):
    def GetConfirmedGracePeriodOrdersAsync(
        self,
        gracePeriod: TimeSpan,
        cancellationToken: CancellationToken,
    ) -> ValueTask[List[int]]: ...

class BackgroundTaskOptions:
    CheckUpdateTime: int
    GracePeriodTime: int

@static
class Extensions:
    @staticmethod
    def AddApplicationServices(builder: 'this IHostApplicationBuilder') -> void: ...

@record
class GracePeriodConfirmedIntegrationEvent(IntegrationEvent):
    OrderId: Readonly[int]
    def __init__(self, orderId: int): ...

class GracePeriodManagerService(BackgroundService): ...
