import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.Gson;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
public class VStarHandler implements HttpHandler {
  @Override    
  public void handle(HttpExchange httpExchange) throws IOException {
    if ("GET".equals(httpExchange.getRequestMethod())) {
      Map<String, String> params = queryToMap(httpExchange.getRequestURI().getQuery());
      handleResponse(httpExchange, params.getOrDefault("id", ""));
    } else {
      throw new UnsupportedOperationException("Only get request are supported");
    }
  }

  private static Map<String, String> queryToMap(String query) {
    if(query == null) {
        return null;
    }
    Map<String, String> result = new HashMap<>();
    for (String param : query.split("&")) {
        String[] entry = param.split("=");
        if (entry.length > 1) {
            result.put(entry[0], entry[1]);
        }else{
            result.put(entry[0], "");
        }
    }
    return result;
}

  private void handleResponse(HttpExchange httpExchange, String cardID) throws IOException {
    System.out.println(cardID);
    Map<String, Object> result = null;
    try {
      Thread.currentThread();
      Thread.sleep(250); // throttle
      result = VStarLibrary.getCardMeta(cardID);
    } catch (Exception e) {
      throw new RuntimeException("Unable to fetch " + cardID);
    }
    Gson gsonObj = new Gson();
    byte[] bytearray = gsonObj.toJson(result).getBytes();
    httpExchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
    httpExchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    httpExchange.getResponseHeaders().add("Access-Control-Allow-Credentials", "true");
    httpExchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    httpExchange.sendResponseHeaders(200, bytearray.length);
    OutputStream outputStream = httpExchange.getResponseBody();
    outputStream.write(bytearray);
    outputStream.flush();
    outputStream.close();
  }
}
