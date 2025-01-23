using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;

namespace WebSocketAPI
{
    public class ChatHub
    {
        private static ConcurrentDictionary<string, WebSocket> _sockets = new ConcurrentDictionary<string, WebSocket>();

        public static async Task ReceiveAndBroadcast(WebSocket socket)
        {
            var buffer = new byte[1024];
            string connectionId = Guid.NewGuid().ToString();
            _sockets.TryAdd(connectionId, socket);

            try
            {
                while (socket.State == WebSocketState.Open)
                {
                    var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        string message = Encoding.UTF8.GetString(buffer, 0, result.Count);

                        foreach (var item in _sockets)
                        {
                            if (item.Value.State == WebSocketState.Open && item.Key != connectionId)
                            {
                                await item.Value.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes(message)), WebSocketMessageType.Text, true, CancellationToken.None);
                            }
                        }
                    }
                    else if (result.MessageType == WebSocketMessageType.Close)
                    {
                        if (result.CloseStatus.HasValue)
                        {
                            await socket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
                        }
                        _sockets.TryRemove(connectionId, out _);
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
            finally
            {
                _sockets.TryRemove(connectionId, out _);
                await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
            }
        }
    }
}
