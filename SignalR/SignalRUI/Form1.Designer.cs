namespace SignalRUI
{
    partial class Form1
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            UserNameTextBox = new TextBox();
            ConnectButton = new Button();
            DisconnectButton = new Button();
            SendButton = new Button();
            MessageTextBox = new TextBox();
            ChatMessagesListBox = new ListBox();
            SuspendLayout();
            // 
            // UserNameTextBox
            // 
            UserNameTextBox.Location = new Point(12, 23);
            UserNameTextBox.Name = "UserNameTextBox";
            UserNameTextBox.Size = new Size(522, 27);
            UserNameTextBox.TabIndex = 0;
            // 
            // ConnectButton
            // 
            ConnectButton.Location = new Point(540, 22);
            ConnectButton.Name = "ConnectButton";
            ConnectButton.Size = new Size(116, 29);
            ConnectButton.TabIndex = 1;
            ConnectButton.Text = "Connect";
            ConnectButton.UseVisualStyleBackColor = true;
            ConnectButton.Click += ConnectButton_Click;
            // 
            // DisconnectButton
            // 
            DisconnectButton.Enabled = false;
            DisconnectButton.Location = new Point(662, 23);
            DisconnectButton.Name = "DisconnectButton";
            DisconnectButton.Size = new Size(126, 29);
            DisconnectButton.TabIndex = 2;
            DisconnectButton.Text = "Disconnect";
            DisconnectButton.UseVisualStyleBackColor = true;
            DisconnectButton.Click += DisconnectButton_Click;
            // 
            // SendButton
            // 
            SendButton.Enabled = false;
            SendButton.Location = new Point(540, 65);
            SendButton.Name = "SendButton";
            SendButton.Size = new Size(116, 29);
            SendButton.TabIndex = 4;
            SendButton.Text = "Send";
            SendButton.UseVisualStyleBackColor = true;
            SendButton.Click += SendButton_Click;
            // 
            // MessageTextBox
            // 
            MessageTextBox.Location = new Point(12, 66);
            MessageTextBox.Name = "MessageTextBox";
            MessageTextBox.Size = new Size(522, 27);
            MessageTextBox.TabIndex = 3;
            // 
            // ChatMessagesListBox
            // 
            ChatMessagesListBox.FormattingEnabled = true;
            ChatMessagesListBox.Location = new Point(12, 113);
            ChatMessagesListBox.Name = "ChatMessagesListBox";
            ChatMessagesListBox.Size = new Size(776, 324);
            ChatMessagesListBox.TabIndex = 5;
            // 
            // Form1
            // 
            AutoScaleDimensions = new SizeF(8F, 20F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(800, 450);
            Controls.Add(ChatMessagesListBox);
            Controls.Add(SendButton);
            Controls.Add(MessageTextBox);
            Controls.Add(DisconnectButton);
            Controls.Add(ConnectButton);
            Controls.Add(UserNameTextBox);
            Name = "Form1";
            Text = "Form1";
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private TextBox UserNameTextBox;
        private Button ConnectButton;
        private Button DisconnectButton;
        private Button SendButton;
        private TextBox MessageTextBox;
        private ListBox ChatMessagesListBox;
    }
}
