using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace SignalRHub
{
    public class ChatHub : Hub
    {
        private static readonly ConcurrentDictionary<string, string> connectedUsers = new ConcurrentDictionary<string, string>();

        public async Task Connect(string userName)
        {
            connectedUsers[Context.ConnectionId] = userName;
            await Clients.All.SendAsync("UserConnected", userName);
        }

        public async Task Disconnect(string userName)
        {
            connectedUsers.TryRemove(Context.ConnectionId, out userName);
            await Clients.All.SendAsync("UserDisconnected", userName);
        }

        public async Task SendMessage(string message)
        {
            string userName = connectedUsers[Context.ConnectionId];
            await Clients.All.SendAsync("NewMessage", userName, message);
        }
    }
}
