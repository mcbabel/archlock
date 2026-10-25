__module__ = "IntegrationEventLogEF"
__paths__ = ["src/IntegrationEventLogEF/**"]
__depends_on__ = ["EventBus"]

class EventStateEnum(Enum):
    NotPublished = 0
    InProgress = 1
    Published = 2
    PublishedFailed = 3

class IIntegrationEventLogService(Protocol):
    def MarkEventAsFailedAsync(self, eventId: Guid) -> Task: ...
    def MarkEventAsInProgressAsync(self, eventId: Guid) -> Task: ...
    def MarkEventAsPublishedAsync(self, eventId: Guid) -> Task: ...
    def RetrieveEventLogsPendingToPublishAsync(
        self,
        transactionId: Guid,
    ) -> Task[IEnumerable[IntegrationEventLogEntry]]: ...
    def SaveEventAsync(
        self,
        event: IntegrationEvent,
        transaction: IDbContextTransaction,
    ) -> Task: ...

class IntegrationEventLogEntry:
    Content: Readonly[string]
    CreationTime: Readonly[DateTime]
    EventId: Readonly[Guid]
    EventTypeName: Readonly[string]
    EventTypeShortName: Readonly[string]
    IntegrationEvent: Readonly[IntegrationEvent]
    State: EventStateEnum
    TimesSent: int
    TransactionId: Readonly[Guid]
    def __init__(self, event: IntegrationEvent, transactionId: Guid): ...
    def DeserializeJsonContent(self, type: Type) -> IntegrationEventLogEntry: ...

class IntegrationEventLogService[TContext: DbContext](IIntegrationEventLogService, IDisposable):
    def __init__(self, context: TContext): ...
    def Dispose(self) -> void: ...
    def MarkEventAsFailedAsync(self, eventId: Guid) -> Task: ...
    def MarkEventAsInProgressAsync(self, eventId: Guid) -> Task: ...
    def MarkEventAsPublishedAsync(self, eventId: Guid) -> Task: ...
    def RetrieveEventLogsPendingToPublishAsync(
        self,
        transactionId: Guid,
    ) -> Task[IEnumerable[IntegrationEventLogEntry]]: ...
    def SaveEventAsync(
        self,
        event: IntegrationEvent,
        transaction: IDbContextTransaction,
    ) -> Task: ...

@static
class IntegrationLogExtensions:
    @staticmethod
    def UseIntegrationEventLogs(builder: 'this ModelBuilder') -> void: ...

class ResilientTransaction:
    def ExecuteAsync(self, action: Func[Task]) -> Task: ...
    @staticmethod
    def New(context: DbContext) -> ResilientTransaction: ...
