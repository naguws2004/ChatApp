using System.Net.WebSockets;
using System.Text;

namespace WebSocketUI
{
    public partial class Form1 : Form
    {
        private ClientWebSocket client;
        private CancellationTokenSource cts;
        private string userName;

        public Form1()
        {
            InitializeComponent();
        }

        private async void ConnectButton_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(UserNameTextBox.Text))
            {
                MessageBox.Show("Please enter your username.");
                return;
            }

            userName = UserNameTextBox.Text;

            try
            {
                client = new ClientWebSocket();
                await client.ConnectAsync(new Uri("ws://localhost:5243/ws"), CancellationToken.None); // Replace with your WebSocket server address

                ConnectButton.Enabled = false;
                DisconnectButton.Enabled = true;
                MessageTextBox.Enabled = true;
                SendButton.Enabled = true;

                MessageBox.Show("Connected to chat server.");

                cts = new CancellationTokenSource();
                Task receiveTask = ReceiveMessagesAsync(cts.Token);

            }
            catch (Exception ex)
            {
                MessageBox.Show($"Could not connect: {ex.Message}");
            }
        }

        private async void DisconnectButton_Click(object sender, EventArgs e)
        {
            try
            {
                await client.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                cts.Cancel();

                ConnectButton.Enabled = true;
                DisconnectButton.Enabled = false;
                MessageTextBox.Enabled = false;
                SendButton.Enabled = false;

                ChatMessagesListBox.Items.Clear();

                MessageBox.Show("Disconnected from chat server.");
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Could not disconnect: {ex.Message}");
            }
        }

        private async void SendButton_Click(object sender, EventArgs e)
        {
            if (!string.IsNullOrEmpty(MessageTextBox.Text))
            {
                try
                {
                    string message = $"{userName}: {MessageTextBox.Text}";
                    ArraySegment<byte> bytesToSend = Encoding.UTF8.GetBytes(message);
                    await client.SendAsync(bytesToSend, WebSocketMessageType.Text, true, CancellationToken.None);
                    ChatMessagesListBox.Items.Add(message);
                    MessageTextBox.Text = string.Empty;
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Could not send message: {ex.Message}");
                }
            }
        }

        private async Task ReceiveMessagesAsync(CancellationToken cancellationToken)
        {
            ArraySegment<byte> buffer = new ArraySegment<byte>(new byte[1024]);
            while (!cancellationToken.IsCancellationRequested)
            {
                WebSocketReceiveResult result = await client.ReceiveAsync(buffer, cancellationToken);

                if (result.MessageType == WebSocketMessageType.Text)
                {
                    string message = Encoding.UTF8.GetString(buffer.Array, 0, result.Count);
                    ChatMessagesListBox.Items.Add(message);
                }
            }
        }
    }
}