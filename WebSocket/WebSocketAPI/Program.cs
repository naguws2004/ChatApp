using System.Net.Sockets;
using System.Net.WebSockets;
using WebSocketAPI;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseWebSockets();

app.UseRouting();

app.UseEndpoints(endpoints =>
{
    _ = endpoints.MapGet("/ws", async (HttpContext context) =>
    {
        if (context.WebSockets.IsWebSocketRequest)
        {
            using (WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync())
            {
                await ChatHub.ReceiveAndBroadcast(webSocket);
            }
        }
        else
        {
            context.Response.StatusCode = 400;
        }
    });
});

app.Run();
