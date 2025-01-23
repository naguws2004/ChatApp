using Microsoft.AspNetCore.SignalR.Client;

namespace SignalRUI
{
    public partial class Form1 : Form
    {
        private HubConnection connection;
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

            connection = new HubConnectionBuilder()
                .WithUrl("http://localhost:5151/chat") // Replace with your server address
                .Build();

            try
            {
                await connection.StartAsync();
                await connection.InvokeAsync("Connect", userName);

                ConnectButton.Enabled = false;
                DisconnectButton.Enabled = true;
                MessageTextBox.Enabled = true;
                SendButton.Enabled = true;

                MessageBox.Show("Connected to chat server.");
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Could not connect: {ex.Message}");
            }

            connection.On<string, string>("NewMessage", (user, message) =>
            {
                Invoke((Action)(() =>
                {
                    ChatMessagesListBox.Items.Add($"{user}: {message}");
                }));
            });

            connection.On<string>("UserConnected", (user) =>
            {
                Invoke((Action)(() =>
                {
                    ChatMessagesListBox.Items.Add($"{user} has joined the chat.");
                }));
            });

            connection.On<string>("UserDisconnected", (user) =>
            {
                Invoke((Action)(() =>
                {
                    ChatMessagesListBox.Items.Add($"{user} has left the chat.");
                }));
            });
        }

        private async void DisconnectButton_Click(object sender, EventArgs e)
        {
            try
            {
                await connection.InvokeAsync("Disconnect", userName);
                await connection.StopAsync();

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
                    await connection.InvokeAsync("SendMessage", MessageTextBox.Text);
                    MessageTextBox.Text = string.Empty;
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Could not send message: {ex.Message}");
                }
            }
        }
    }
}
