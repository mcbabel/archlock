__module__ = "EventBus"
__paths__ = ["src/EventBus/**"]
__depends_on__ = []

class IEventBus(Protocol):
    def PublishAsync(self, event: IntegrationEvent) -> Task: ...

class IEventBusBuilder(Protocol):
    Services: Readonly[IServiceCollection]

class IIntegrationEventHandler[TIntegrationEvent: IntegrationEvent](IIntegrationEventHandler, Protocol):
    @overload
    def Handle(self, event: TIntegrationEvent) -> Task: ...
    @overload
    def Handle(self, event: IntegrationEvent) -> Task: ...

@static
class EventBusBuilderExtensions:
    @staticmethod
    def AddSubscription[T: IntegrationEvent, 'TH: class, IIntegrationEventHandler[T]'](
        eventBusBuilder: 'this IEventBusBuilder',
    ) -> IEventBusBuilder: ...
    @staticmethod
    def ConfigureJsonOptions(
        eventBusBuilder: 'this IEventBusBuilder',
        configure: Action[JsonSerializerOptions],
    ) -> IEventBusBuilder: ...

class EventBusSubscriptionInfo:
    EventTypes: Readonly[Dictionary[string, Type]]
    JsonSerializerOptions: Readonly[JsonSerializerOptions]

@static
class GenericTypeExtensions:
    @staticmethod
    @overload
    def GetGenericTypeName(type: 'this Type') -> string: ...
    @staticmethod
    @overload
    def GetGenericTypeName(object: 'this object') -> string: ...

@record
class IntegrationEvent:
    CreationDate: DateTime
    Id: Guid
    def __init__(self): ...
