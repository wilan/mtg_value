import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.NumberFormat;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

public class VStarLibrary {
  // rarity mapping
  // url mapping
  private static TreeMap<Integer, String> RARITY_MAPPING = new TreeMap<>();
  private static HashMap<Integer, String> URL_MAPPING = new HashMap<>();

  static {
    RARITY_MAPPING.put(0, "???");
    RARITY_MAPPING.put(173, "AR");
    RARITY_MAPPING.put(201, "PIKA_AR");
    RARITY_MAPPING.put(210, "SAR");
    RARITY_MAPPING.put(235, "SAR_T");
    RARITY_MAPPING.put(245, "SR_T");
    RARITY_MAPPING.put(251, "SR_E");
    RARITY_MAPPING.put(259, "UR");

    URL_MAPPING.put(1, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/paras-1");
    URL_MAPPING.put(2, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/parasect-2");
    URL_MAPPING.put(3, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisuian-voltorb-3");
    URL_MAPPING.put(4, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisuian-electrode-4");
    URL_MAPPING.put(5, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisuian-electrode-v-5");
    URL_MAPPING.put(6, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/turtwig-6");
    URL_MAPPING.put(7, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/grotle-7");
    URL_MAPPING.put(8, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/torterra-8");
    URL_MAPPING.put(9, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/kricketot-9");
    URL_MAPPING.put(10, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/kricketune-10");
    URL_MAPPING.put(11, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/leafeon-v-11");
    URL_MAPPING.put(12, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/leafeon-vstar-12");
    URL_MAPPING.put(13, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/charizard-v-13");
    URL_MAPPING.put(14, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/charizard-vstar-14");
    URL_MAPPING.put(15, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/radiant-charizard-15");
    URL_MAPPING.put(16, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/magmar-16");
    URL_MAPPING.put(17, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/magmortar-17");
    URL_MAPPING.put(18, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/moltres-18");
    URL_MAPPING.put(19, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/entei-v-19");
    URL_MAPPING.put(20, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/simisear-v-20");
    URL_MAPPING.put(21, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/simisear-vstar-21");
    URL_MAPPING.put(22, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/oricorio-22");
    URL_MAPPING.put(23, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/lapras-23");
    URL_MAPPING.put(24, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/suicune-v-24");
    URL_MAPPING.put(25, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/regice-25");
    URL_MAPPING.put(26, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/lumineon-v-26");
    URL_MAPPING.put(27, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/origin-forme-palkia-v-27");
    URL_MAPPING.put(28,
        "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/origin-forme-palkia-vstar-28");
    URL_MAPPING.put(29, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/manaphy-29");
    URL_MAPPING.put(30, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisuian-basculin-30");
    URL_MAPPING.put(31, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisuian-basculegion-31");
    URL_MAPPING.put(32, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/keldeo-32");
    URL_MAPPING.put(33, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/radiant-greninja-33");
    URL_MAPPING.put(34, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/electabuzz-34");
    URL_MAPPING.put(35, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/electivire-35");
    URL_MAPPING.put(36, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/mareep-36");
    URL_MAPPING.put(37, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/flaaffy-37");
    URL_MAPPING.put(38, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/raikou-v-38");
    URL_MAPPING.put(39, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/radiant-charjabug-39");
    URL_MAPPING.put(40, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/zeraora-v-40");
    URL_MAPPING.put(41, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/zeraora-vmax-41");
    URL_MAPPING.put(42, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/zeraora-vstar-42");
    URL_MAPPING.put(43, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/toxel-43");
    URL_MAPPING.put(44, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/toxtricity-44");
    URL_MAPPING.put(45, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/regieleki-45");
    URL_MAPPING.put(46, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/gastly-46");
    URL_MAPPING.put(47, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/haunter-47");
    URL_MAPPING.put(48, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/gengar-48");
    URL_MAPPING.put(49, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/galarian-articuno-49");
    URL_MAPPING.put(50, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/mewtwo-v-50");
    URL_MAPPING.put(51, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/mewtwo-vstar-51");
    URL_MAPPING.put(52, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/mew-52");
    URL_MAPPING.put(53, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/mew-v-53");
    URL_MAPPING.put(54, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/mew-vmax-54");
    URL_MAPPING.put(55, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/radiant-gardevoir-55");
    URL_MAPPING.put(56, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/lunatone-56");
    URL_MAPPING.put(57, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/duskull-57");
    URL_MAPPING.put(58, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/dusclops-58");
    URL_MAPPING.put(59, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/dusknoir-59");
    URL_MAPPING.put(60, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/deoxys-60");
    URL_MAPPING.put(61, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/pumpkaboo-61");
    URL_MAPPING.put(62, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/gourgeist-62");
    URL_MAPPING.put(63, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/diancie-63");
    URL_MAPPING.put(64, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/comfey-64");
    URL_MAPPING.put(65, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hatterene-v-65");
    URL_MAPPING.put(66, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hatterene-vmax-66");
    URL_MAPPING.put(67, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/zacian-v-67");
    URL_MAPPING.put(68, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/enamorus-v-68");
    URL_MAPPING.put(69, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisuian-growlithe-69");
    URL_MAPPING.put(70, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisuian-arcanine-70");
    URL_MAPPING.put(71, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/machamp-v-71");
    URL_MAPPING.put(72, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/machamp-v-72");
    URL_MAPPING.put(73, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/galarian-zapdos-73");
    URL_MAPPING.put(74, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/solrock-74");
    URL_MAPPING.put(75, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/regirock-75");
    URL_MAPPING.put(76, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/riolu-76");
    URL_MAPPING.put(77, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/lucario-77");
    URL_MAPPING.put(78, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/radiant-hawlucha-78");
    URL_MAPPING.put(79, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/galarian-moltres-79");
    URL_MAPPING.put(80, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/galarian-moltres-v-80");
    URL_MAPPING.put(81, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/poochyena-81");
    URL_MAPPING.put(82, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/mightyena-82");
    URL_MAPPING.put(83, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/absol-83");
    URL_MAPPING.put(84, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/spiritomb-84");
    URL_MAPPING.put(85, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/drapion-v-85");
    URL_MAPPING.put(86, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisuian-samurott-v-86");
    URL_MAPPING.put(87, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisuian-samurott-vstar-87");
    URL_MAPPING.put(88, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/purrloin-88");
    URL_MAPPING.put(89, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/liepard-89");
    URL_MAPPING.put(90, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/zorua-90");
    URL_MAPPING.put(91, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/zoroark-91");
    URL_MAPPING.put(92, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/nickit-92");
    URL_MAPPING.put(93, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/thievul-93");
    URL_MAPPING.put(94, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/magnemite-94");
    URL_MAPPING.put(95, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/magneton-95");
    URL_MAPPING.put(96, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/magnezone-96");
    URL_MAPPING.put(97, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/registeel-97");
    URL_MAPPING.put(98, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/bronzor-98");
    URL_MAPPING.put(99, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/bronzong-99");
    URL_MAPPING.put(100,
        "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/origin-forme-dialga-v-100");
    URL_MAPPING.put(101,
        "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/origin-forme-dialga-vstar-101");
    URL_MAPPING.put(102, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/genesect-v-102");
    URL_MAPPING.put(103, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/zamazenta-v-103");
    URL_MAPPING.put(104, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/altaria-104");
    URL_MAPPING.put(105, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/latias-105");
    URL_MAPPING.put(106, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/latios-106");
    URL_MAPPING.put(107, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/rayquaza-v-107");
    URL_MAPPING.put(108, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/rayquaza-vmax-108");
    URL_MAPPING.put(109, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/garchomp-v-109");
    URL_MAPPING.put(110, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/giratina-v-110");
    URL_MAPPING.put(111, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/giratina-vstar-111");
    URL_MAPPING.put(112, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/goomy-112");
    URL_MAPPING.put(113, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisuian-sliggoo-113");
    URL_MAPPING.put(114, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisuian-goodra-114");
    URL_MAPPING.put(115, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/radiant-eternatus-115");
    URL_MAPPING.put(116, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/regidrago-116");
    URL_MAPPING.put(117, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/ditto-117");
    URL_MAPPING.put(118, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/dunsparce-118");
    URL_MAPPING.put(119, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/miltank-119");
    URL_MAPPING.put(120, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/swablu-120");
    URL_MAPPING.put(121, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/bidoof-121");
    URL_MAPPING.put(122, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/bibarel-122");
    URL_MAPPING.put(123, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/regigigas-123");
    URL_MAPPING.put(124, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/regigigas-v-124");
    URL_MAPPING.put(125, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/regigigas-vstar-125");
    URL_MAPPING.put(126, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/arceus-v-126");
    URL_MAPPING.put(127, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/arceus-vstar-127");
    URL_MAPPING.put(128, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisuian-zoroark-v-128");
    URL_MAPPING.put(129,
        "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisuian-zoroark-vstar-129");
    URL_MAPPING.put(130, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/oranguru-v-130");
    URL_MAPPING.put(131, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/wyrdeer-v-131");
    URL_MAPPING.put(132, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/fan-of-waves-132");
    URL_MAPPING.put(133, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/gutsy-pickaxe-133");
    URL_MAPPING.put(134, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/fog-crystal-134");
    URL_MAPPING.put(135, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/dark-patch-135");
    URL_MAPPING.put(136, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/damage-pump-136");
    URL_MAPPING.put(137, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/trekking-boots-137");
    URL_MAPPING.put(138, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/ultra-ball-138");
    URL_MAPPING.put(139, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/power-tablet-139");
    URL_MAPPING.put(140, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisuian-heavy-ball-140");
    URL_MAPPING.put(141, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/mirage-gate-141");
    URL_MAPPING.put(142, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/rescue-carrier-142");
    URL_MAPPING.put(143, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/level-ball-143");
    URL_MAPPING.put(144, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/lost-vacuum-144");
    URL_MAPPING.put(145, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/choice-belt-145");
    URL_MAPPING.put(146, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/sky-seal-stone-146");
    URL_MAPPING.put(147, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/leafy-camo-poncho-147");
    URL_MAPPING.put(148, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/colress's-experiment-148");
    URL_MAPPING.put(149, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/irida-149");
    URL_MAPPING.put(150, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/elesa's-sparkle-150");
    URL_MAPPING.put(151, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/raihan-151");
    URL_MAPPING.put(152, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/grant-152");
    URL_MAPPING.put(153, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/cynthia's-ambition-153");
    URL_MAPPING.put(154, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/sinnoh-friends-154");
    URL_MAPPING.put(155, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/adaman-155");
    URL_MAPPING.put(156, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/cheren's-care-156");
    URL_MAPPING.put(157, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/roxanne-157");
    URL_MAPPING.put(158, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/gardenia's-vigor-158");
    URL_MAPPING.put(159, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/professor's-research-159");
    URL_MAPPING.put(160, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisui-friends-160");
    URL_MAPPING.put(161, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/boss's-orders-161");
    URL_MAPPING.put(162, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/melony-162");
    URL_MAPPING.put(163, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/cheryl-163");
    URL_MAPPING.put(164, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/stormy-mountains-164");
    URL_MAPPING.put(165, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/path-to-the-peak-165");
    URL_MAPPING.put(166, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/gapejaw-bog-166");
    URL_MAPPING.put(167, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/collapsed-stadium-167");
    URL_MAPPING.put(168, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/jubilife-village-168");
    URL_MAPPING.put(169, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/temple-of-sinnoh-169");
    URL_MAPPING.put(170, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/magma-basin-170");
    URL_MAPPING.put(171, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/double-turbo-energy-171");
    URL_MAPPING.put(172, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/fusion-strike-energy-172");
    URL_MAPPING.put(173, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisuian-voltorb-173");
    URL_MAPPING.put(174, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/kricketune-174");
    URL_MAPPING.put(175, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/magmortar-175");
    URL_MAPPING.put(176, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/oricorio-176");
    URL_MAPPING.put(177, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/lapras-177");
    URL_MAPPING.put(178, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/manaphy-178");
    URL_MAPPING.put(179, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/keldeo-179");
    URL_MAPPING.put(180, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/electivire-180");
    URL_MAPPING.put(181, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/toxtricity-181");
    URL_MAPPING.put(182, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/galarian-articuno-182");
    URL_MAPPING.put(183, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/mew-183");
    URL_MAPPING.put(184, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/lunatone-184");
    URL_MAPPING.put(185, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/deoxys-185");
    URL_MAPPING.put(186, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/diancie-186");
    URL_MAPPING.put(187, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/comfey-187");
    URL_MAPPING.put(188, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/galarian-zapdos-188");
    URL_MAPPING.put(189, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/solrock-189");
    URL_MAPPING.put(190, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/galarian-moltres-190");
    URL_MAPPING.put(191, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/absol-191");
    URL_MAPPING.put(192, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/thievul-192");
    URL_MAPPING.put(193, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/magnezone-193");
    URL_MAPPING.put(194, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/altaria-194");
    URL_MAPPING.put(195, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/latias-195");
    URL_MAPPING.put(196, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisuian-goomy-196");
    URL_MAPPING.put(197, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/ditto-197");
    URL_MAPPING.put(198, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/dunsparce-198");
    URL_MAPPING.put(199, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/miltank-199");
    URL_MAPPING.put(200, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/bibarel-200");
    URL_MAPPING.put(201, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/riolu-201");
    URL_MAPPING.put(202, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/swablu-202");
    URL_MAPPING.put(203, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/duskull-203");
    URL_MAPPING.put(204, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/bidoof-204");
    URL_MAPPING.put(205, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/pikachu-205");
    URL_MAPPING.put(206, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/turtwig-206");
    URL_MAPPING.put(207, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/paras-207");
    URL_MAPPING.put(208, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/poochyena-208");
    URL_MAPPING.put(209, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/mareep-209");
    URL_MAPPING.put(210, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/leafeon-vstar-210");
    URL_MAPPING.put(211, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/charizard-v-211");
    URL_MAPPING.put(212, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/charizard-vstar-212");
    URL_MAPPING.put(213, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/entei-213");
    URL_MAPPING.put(214, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/simisear-vstar-214");
    URL_MAPPING.put(215, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/suicune-215");
    URL_MAPPING.put(216, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/lumineon-v-216");
    URL_MAPPING.put(217, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/glaceon-vstar-217");
    URL_MAPPING.put(218, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/raikou-218");
    URL_MAPPING.put(219, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/zeraora-vmax-219");
    URL_MAPPING.put(220, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/zeraora-vstar-220");
    URL_MAPPING.put(221, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/mewtwo-vstar-221");
    URL_MAPPING.put(222, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/deoxys-vmax-222");
    URL_MAPPING.put(223, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/deoxys-vstar-223");
    URL_MAPPING.put(224, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hatterene-vmax-224");
    URL_MAPPING.put(225, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/zacian-v-225");
    URL_MAPPING.put(226, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/lucario-vstar-226");
    URL_MAPPING.put(227, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/drapion-v-227");
    URL_MAPPING.put(228, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/darkrai-vstar-228");
    URL_MAPPING.put(229, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisuian-samurott-v-229");
    URL_MAPPING.put(230,
        "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisuian-samurott-vstar-230");
    URL_MAPPING.put(231, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hoopa-v-231");
    URL_MAPPING.put(232, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/zamazenta-v-232");
    URL_MAPPING.put(233, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/regigigas-vstar-233");
    URL_MAPPING.put(234,
        "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/hisuian-zoroark-vstar-234");
    URL_MAPPING.put(235, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/colress's-experiment-235");
    URL_MAPPING.put(236, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/irida-236");
    URL_MAPPING.put(237, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/raihan-237");
    URL_MAPPING.put(238, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/grant-238");
    URL_MAPPING.put(239, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/cynthia's-aspiration-239");
    URL_MAPPING.put(240, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/adaman-240");
    URL_MAPPING.put(241, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/cheren's-care-241");
    URL_MAPPING.put(242, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/roxanne-242");
    URL_MAPPING.put(243, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/gardenia's-vigor-243");
    URL_MAPPING.put(244, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/melony-244");
    URL_MAPPING.put(245, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/volo-245");
    URL_MAPPING.put(246, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/elesa's-sparkle-246");
    URL_MAPPING.put(247, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/friends-in-sinnoh-247");
    URL_MAPPING.put(248, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/professor's-reaserch-248");
    URL_MAPPING.put(249, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/friends-in-hisui-249");
    URL_MAPPING.put(250, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/boss's-orders-250");
    URL_MAPPING.put(251, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/grass-energy-251");
    URL_MAPPING.put(252, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/fire-energy-252");
    URL_MAPPING.put(253, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/water-energy-253");
    URL_MAPPING.put(254, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/lightning-energy-254");
    URL_MAPPING.put(255, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/psychic-energy-255");
    URL_MAPPING.put(256, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/fighting-energy-256");
    URL_MAPPING.put(257, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/darkness-energy-257");
    URL_MAPPING.put(258, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/metal-energy-258");
    URL_MAPPING.put(259,
        "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/origin-forme-palkia-vstar-259");
    URL_MAPPING.put(260,
        "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/origin-forme-dialga-vstar-260");
    URL_MAPPING.put(261, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/giratina-vstar-261");
    URL_MAPPING.put(262, "https://www.pricecharting.com/game/pokemon-japanese-vstar-universe/arceus-vstar-262");
  }

  private static String getRarity(String number, String name) {
    if (name.toLowerCase().contains("radiant")) {
      return "K";
    }
    return RARITY_MAPPING.floorEntry(Integer.valueOf(number)).getValue();
  }

  public static void main(String args[]) throws Exception {
    System.out.println(getCardMeta("242"));
  }

  public static Map<String, Object> getCardMeta(String number) throws Exception {
    String url = URL_MAPPING.get(Integer.valueOf(number));
    String html = getUrl(url);
    Document doc = Jsoup.parse(html.toString());
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
    HashMap<String, Object> meta = new HashMap<>();
    meta.put("name", name);
    meta.put("type", type);
    meta.put("urlSmall", imageUrl);
    meta.put("urlNormal", imageUrl);
    meta.put("regPrice", price);
    meta.put("foilPrice", price);
    meta.put("number", number);
    meta.put("rarity", getRarity(number, name));
    return meta;
  } 

  private static String getUrl(String urlString) throws Exception {
    StringBuilder result = new StringBuilder();
    URL url = new URL(urlString);
    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
    conn.setRequestMethod("GET");
    try (BufferedReader reader = new BufferedReader(
        new InputStreamReader(conn.getInputStream()))) {
      for (String line; (line = reader.readLine()) != null;) {
        result.append(line);
      }
    }
    return result.toString();
  }
}
