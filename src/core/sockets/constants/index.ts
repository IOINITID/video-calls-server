export const Event = {
  Default: {
    Connection: 'connection',
    ConnectError: 'connect_error',
    Disconnect: 'disconnect',
    Disconnecting: 'disconnecting',
    NewListener: 'newListener',
    RemoveListener: 'removeListener',
  },
  Client: {
    Connect: 'client:connect',
    Disconnect: 'client:disconnect',
    SentInvitation: 'client:sent_invitation',
    DeclineInvitation: 'client:decline_invitation',
  },
  Server: {
    Connect: 'server:connect',
    Disconnect: 'server:disconnect',
    SentInvitation: 'server:sent_invitation',
    DeclineInvitation: 'server:decline_invitation',
  },
};
