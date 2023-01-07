import java.io.File;
import java.text.NumberFormat;
import java.util.Scanner;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

public class Test {
  /*
   * export interface Card {
  name: string; OK (include the number)
  type: string; "POKEMON"
  timestamp: number; now
  urlSmall: string; OK
  urlNormal: string; OK
  regPrice: number; OK
  foilPrice: number; OK
  set: string; s12a
  number: string; OK
  rarity: string; N/A
  version?: string; OK
}
   */
  public static void main(String args[]) throws Exception {
    System.out.println(VStarLibrary.getCardMeta("78"));
  }

  public static void parseTestData() throws Exception {
    Scanner sc = new Scanner(new File("mtg_value/test_vstar"));
    StringBuilder line = new StringBuilder();
    while (sc.hasNextLine()) {
      line.append(sc.nextLine());
    }

    Document doc = Jsoup.parse(line.toString());
    String name = doc.select("#product_name").textNodes().get(0).toString();
    String type = "???";
    String imageUrl = doc.select(".cover").select("img").attr("src");
    String priceString = doc.select("#price_data").select("#used_price").select(".price").text();
    NumberFormat format = NumberFormat.getCurrencyInstance();
    Number price = 0;
    try {
      price = format.parse(priceString);
    } catch (Exception ex) {
      System.out.println("Unable to parse price " + priceString);
    }
    System.out.println(price);
  }

  // Setup a server
  // Test the cors
  // Setup the mapping
  // Do the parsing logic
  
}
