using Newtonsoft.Json;
using Shop.Core.Orders;

namespace Shop.Api.Controllers;

/// <summary>HTTP endpoints for orders.</summary>
public class OrdersController
{
    public string Get(string id) => JsonConvert.SerializeObject(new Order(id));
}
