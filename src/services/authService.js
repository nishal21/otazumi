import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { users, passwordResetTokens, emailVerificationTokens, favorites, watchlist, watchHistory } from '../db/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import { EmailService } from './emailService.js';

/**
 * Generate a secure random token (browser-compatible)
 */
function generateSecureToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export class AuthService {
  /**
   * Check daily signup limit (300 per day to maintain Gmail 500/day limit)
   * Stores count in localStorage with date reset
   */
  static checkDailySignupLimit() {
    const today = new Date().toDateString();
    const signupData = localStorage.getItem('daily_signups');
    
    let signupInfo = signupData ? JSON.parse(signupData) : { date: today, count: 0 };
    
    // Reset count if new day
    if (signupInfo.date !== today) {
      signupInfo = { date: today, count: 0 };
    }
    
    // Check if limit reached (300 signups per day)
    if (signupInfo.count >= 300) {
      throw new Error('Daily signup limit reached. Please try again tomorrow. This limit helps us maintain reliable email delivery for all users.');
    }
    
    return signupInfo;
  }
  
  /**
   * Increment daily signup counter
   */
  static incrementSignupCount(signupInfo) {
    signupInfo.count += 1;
    localStorage.setItem('daily_signups', JSON.stringify(signupInfo));
    console.log(`📊 Daily signups: ${signupInfo.count}/300`);
  }

  // Register a new user
  static async register(userData) {
    try {
      // Check daily signup limit FIRST before any database operations
      const signupInfo = this.checkDailySignupLimit();
      
      const { email, username, password } = userData;
      
      // Validate Gmail requirement
      if (!email.endsWith('@gmail.com')) {
        throw new Error('Only Gmail addresses (@gmail.com) are allowed for registration.');
      }
      
      // Comprehensive disposable email check
      const disposableDomains = [
        "spambog.net", "spambog.ru", "spambooger.com", "spambox.info", "spambox.me", "spambox.org", "spambox.us", "spamcero.com", "spamcon.org", "spamcorptastic.com", "spamcowboy.com", "spamcowboy.net", "spamcowboy.org", "spamday.com", "spamdecoy.net", "spamex.com", "spamfellas.com", "spamfighter.cf", "spamfighter.ga", "spamfighter.gq", "spamfighter.ml", "spamfighter.tk", "spamfree.eu", "spamfree24.com", "spamfree24.de", "spamfree24.eu", "spamfree24.info", "spamfree24.net", "spamfree24.org", "spamgoes.in", "spamherelots.com", "spamhereplease.com", "spamhole.com", "spamify.com", "spaminator.de", "spamkill.info", "spaml.com", "spaml.de", "spamlot.net", "spammer.fail", "spammotel.com", "spammy.host", "spamobox.com", "spamoff.de", "spamsalad.in", "spamsandwich.com", "spamslicer.com", "spamsphere.com", "spamspot.com", "spamstack.net", "spamthis.co.uk", "spamthis.network", "spamthisplease.com", "spamtrail.com", "spamtrap.ro", "spamtroll.net", "spamwc.cf", "spamwc.ga", "spamwc.gq", "spamwc.ml", "speedgaus.net", "sperma.cf", "spicysoda.com", "spikio.com", "spindl-e.com", "spinly.net", "splitparents.com", "spoofmail.de", "sportrid.com", "spr.io", "spritzzone.de", "spruzme.com", "spybox.de", "spymail.com", "spymail.one", "squizzy.de", "squizzy.net", "sroff.com", "sry.li", "ssoia.com", "sssig.one", "stacys.mom", "stanfordujjain.com", "starlight-breaker.net", "starmail.net", "starpower.space", "startfu.com", "startkeys.com", "statdvr.com", "stathost.net", "statiix.com", "stayhome.li", "steam-area.ru", "steambot.net", "stexsy.com", "stinkefinger.net", "stop-my-spam.cf", "stop-my-spam.com", "stop-my-spam.ga", "stop-my-spam.ml", "stop-my-spam.pp.ua", "stop-my-spam.tk", "stopspam.app", "storegmail.net", "storiqax.top", "storj99.com", "storj99.top", "streetwisemail.com", "stromox.com", "stuckmail.com", "stuffmail.de", "stufmail.com", "stumpfwerk.com", "stylist-volos.ru", "submic.com", "suburbanthug.com", "suckmyd.com", "sudern.de", "sueshaw.com", "suexamplesb.com", "suioe.com", "super-auswahl.de", "superblohey.com", "supergreatmail.com", "supermailer.jp", "superplatyna.com", "superrito.com", "supersave.net", "superstachel.de", "superyp.com", "supporttc.com", "suremail.info", "sute.jp", "svetims.com", "svip520.cn", "svk.jp", "svxr.org", "sweetpotato.ml", "sweetxxx.de", "swift-mail.net", "swift10minutemail.com", "swsdz.com", "syinxun.com", "sylvannet.com", "symphonyresume.com", "synarca.com", "syncax.com", "syosetu.gq", "syujob.accountants", "szerz.com", "tacomail.de", "tafmail.com", "tafoi.gr", "taglead.com", "tagmymedia.com", "tagyourself.com", "taimb.com", "talemarketing.com", "talkinator.com", "talmetry.com", "tanlanav.com", "tanukis.org", "taobudao.com", "tapchicuoihoi.com", "taphear.com", "tapi.re", "tartinemoi.com", "tarzanmail.cf", "tastmemail.com", "tastrg.com", "tatsu.uk", "taugr.com", "taukah.com", "taxibmt.com", "tb-on-line.net", "tbgroupconsultants.com", "tcwlm.com", "tcwlx.com", "tdtda.com", "tech69.com", "techblast.ch", "techemail.com", "techgroup.me", "technoproxy.ru", "techusa.org", "teerest.com", "teewars.org", "tefl.ro", "teihu.com", "telecomix.pl", "teleg.eu", "telegmail.com", "teleworm.com", "teleworm.us", "teligmail.site", "telimail.online", "tellos.xyz", "telvetto.com", "temailz.com", "teml.net", "temp-link.net", "temp-mail.best", "temp-mail.cfd", "temp-mail.com", "temp-mail.de", "temp-mail.now", "temp-mail.org", "temp-mail.pp.ua", "temp-mail.ru", "temp-mails.com", "tempail.com", "tempalias.com", "tempe-mail.com", "tempemail.biz", "tempemail.co.za", "tempemail.com", "tempemail.net", "tempemailgen.com", "tempemaill.com", "tempemailo.org", "tempinbox.co.uk", "tempinbox.com", "tempmail.cn", "tempmail.co", "tempmail.de", "tempmail.email", "tempmail.eu", "tempmail.id.vn", "tempmail.io.vn", "tempmail.it", "tempmail.ninja", "tempmail.plus", "tempmail.pp.ua", "tempmail.us", "tempmail.vip", "tempmail.ws", "tempmail2.com", "tempmaildemo.com", "tempmailer.com", "tempmailer.de", "tempmailer.net", "tempmailfree.net", "tempmailo.com", "tempmails.net", "tempmailyo.org", "tempomail.fr", "tempomail.org", "tempomailo.site", "temporalemail.org", "temporam.com", "temporarily.de", "temporarioemail.com.br", "temporarly.com", "temporary-mail.net", "temporaryemail.net", "temporaryemail.us", "temporaryforwarding.com", "temporaryinbox.com", "temporarymailaddress.com", "tempp-mails.com", "temppppo.store", "tempr.email", "tempsky.com", "temptami.com", "tempthe.net", "tempymail.com", "tensi.org", "tenull.com", "ternaklele.ga", "testore.co", "testudine.com", "tevstart.com", "tgduck.com", "thanksnospam.info", "thankyou2010.com", "thatim.info", "thc.st", "the23app.com", "theaviors.com", "thebearshark.com", "thecarinformation.com", "thecity.biz", "thediamants.org", "thedirhq.info", "theeyeoftruth.com", "thegrampians.net", "thejoker5.com", "thelightningmail.net", "thelimestones.com", "thembones.com.au", "themegreview.com", "themostemail.com", "thereddoors.online", "theroyalweb.club", "thescrappermovie.com", "thespamfather.com", "theteastory.info", "thetechnext.net", "thex.ro", "thichanthit.com", "thietbivanphong.asia", "thirifara.com", "thisisnotmyrealemail.com", "thismail.net", "thisurl.website", "thnikka.com", "thoas.ru", "thraml.com", "thrma.com", "throam.com", "thrott.com", "throwam.com", "throwawayemailaddress.com", "throwawaymail.com", "throwawaymail.pp.ua", "throya.com", "thrubay.com", "thshyo.org", "thunderbolt.science", "thunkinator.org", "thxmate.com", "tiapz.com", "tic.ec", "tidissajiiu.com", "tikanony.com", "tiktakgrab.shop", "tilien.com", "timgiarevn.com", "timkassouf.com", "tinoza.org", "tinytimer.org", "tinyurl24.com", "tipsb.com", "tittbit.in", "tiv.cc", "tizi.com", "tkitc.de", "tlpn.org", "tmail.com", "tmail.edu.rs", "tmail.io", "tmail.link", "tmail.ws", "tmail3.com", "tmail6.com", "tmail9.com", "tmaile.net", "tmailinator.com", "tmails.net", "tmmbt.net", "tmpbox.net", "tmpemails.com", "tmpeml.com", "tmpeml.info", "tmpjr.me", "tmpmail.net", "tmpmail.org", "tmpmailtor.com", "tmpnator.live", "tmpx.sa.com", "tnbeta.com", "toaik.com", "toddsbighug.com", "tofeat.com", "tohru.org", "toiea.com", "tokem.co", "token.ro", "tokenmail.de", "tonaeto.com", "tonne.to", "tonymanso.com", "too.li", "toolbox.ovh", "toolnator.plus", "toomail.biz", "toon.ml", "top-shop-tovar.ru", "top101.de", "top1mail.ru", "top1post.ru", "topdatamaster.com", "topinrock.cf", "topmail2.com", "topmail2.net", "topofertasdehoy.com", "topranklist.de", "toprumours.com", "topvu.net", "tormail.org", "tospage.com", "toss.pw", "tosunkaya.com", "totallynotfake.net", "totalvista.com", "totesmail.com", "totoan.info", "tourcc.com", "tozya.com", "tp-qa-mail.com", "tppp.one", "tppp.online", "tpwlb.com", "tqoai.com", "tqosi.com", "trackden.com", "tradermail.info", "tranceversal.com", "translateid.com", "trap-mail.de", "trash-amil.com", "trash-mail.at", "trash-mail.cf", "trash-mail.com", "trash-mail.de", "trash-mail.ga", "trash-mail.gq", "trash-mail.ml", "trash-mail.tk", "trash-me.com", "trash2009.com", "trash2010.com", "trash2011.com", "trashcanmail.com", "trashdevil.com", "trashdevil.de", "trashemail.de", "trashemails.de", "trashinbox.com", "trashmail.at", "trashmail.com", "trashmail.de", "trashmail.fr", "trashmail.gq", "trashmail.io", "trashmail.me", "trashmail.net", "trashmail.org", "trashmail.se", "trashmail.ws", "trashmailer.com", "trashmailgenerator.de", "trashmails.com", "trashymail.com", "trashymail.net", "trasz.com", "trayna.com", "trbvm.com", "trbvn.com", "trbvo.com", "trend-maker.ru", "trfu.to", "trgfu.com", "trgovinanaveliko.info", "trialmail.de", "trickmail.net", "trillianpro.com", "triots.com", "trixtrux1.ru", "trolebrotmail.com", "trollproject.com", "tropicalbass.info", "tropovenamail.com", "trungtamtoeic.com", "truthfinderlogin.com", "tryalert.com", "tryninja.io", "trythe.net", "tryzoe.com", "tsderp.com", "ttirv.org", "ttszuo.xyz", "tualias.com", "tuamaeaquelaursa.com", "tumroc.net", "tuofs.com", "tupmail.com", "turoid.com", "turual.com", "turuma.com", "tutuapp.bid", "tvchd.com", "tverya.com", "twinmail.de", "twkly.ml", "twocowmail.net", "twoweirdtricks.com", "twzhhq.online", "txcct.com", "txen.de", "txtadvertise.com", "tyhe.ro", "tyldd.com", "tympe.net", "uacro.com", "uber-mail.com", "ubinert.com", "ubismail.net", "ubm.md", "ucche.us", "ucupdong.ml", "uemail99.com", "ufacturing.com", "ufokeuabmail.com", "ug.wtf", "uggsrock.com", "uguuchantele.com", "uhe2.com", "uhhu.ru", "uiemail.com", "uiu.us", "ujijima1129.gq", "uk.to", "ukm.ovh", "ultra.fyi", "ultrada.ru", "uma3.be", "umail.net", "umil.net", "undeadbank.com", "underseagolf.com", "undo.it", "unicodeworld.com", "unids.com", "unimark.org", "uniromax.com", "unit7lahaina.com", "universall.me", "unmail.ru", "unratito.com", "uooos.com", "uorak.com", "upliftnow.com", "uplipht.com", "uploadnolimit.com", "upozowac.info", "upsnab.net", "urfunktion.se", "urhen.com", "uroid.com", "us.af", "us.to", "usa.cc", "usa.edu.pl", "usako.net", "usbc.be", "usdtbeta.com", "used-product.fr", "ushijima1129.cf", "ushijima1129.ga", "ushijima1129.gq", "ushijima1129.ml", "ushijima1129.tk", "usm.ovh", "ustorp.com", "utiket.us", "uu.gl", "uu2.ovh", "uue.edu.pl", "uuf.me", "uuii.in", "uwork4.us", "uyhip.com", "uz8.net", "vaasfc4.tk", "vaati.org", "vafyxh.com", "valanides.com", "valemail.net", "valhalladev.com", "vankin.de", "vasteron.com", "vaupk.org", "vcois.com", "vctel.com", "vda.ro", "vddaz.com", "vdig.com", "veanlo.com", "veb37.com", "veltexline.com", "vemomail.win", "venompen.com", "veo.kr", "ver0.cf", "ver0.ga", "ver0.gq", "ver0.ml", "ver0.tk", "vercelli.cf", "vercelli.ga", "vercelli.gq", "vercelli.ml", "verdejo.com", "vermutlich.net", "vertexium.net", "veruvercomail.com", "veryday.ch", "veryday.eu", "veryday.info", "veryrealemail.com", "ves.ink", "vesa.pw", "vetra.cyou", "vevs.de", "vexi.my", "via.tokyo.jp", "vibzi.net", "vickaentb.tk", "victime.ninja", "victoriaalison.com", "victoriantwins.com", "vidchart.com", "viditag.com", "vidwobox.com", "viewcastmedia.com", "viewcastmedia.net", "viewcastmedia.org", "vigilantkeep.net", "vigoneo.com", "vikingsonly.com", "vinernet.com", "vintomaper.com", "vipepe.com", "vipmail.name", "vipmail.pw", "vips.pics", "vipxm.net", "viralplays.com", "virtualemail.info", "visal007.tk", "visal168.cf", "visal168.ga", "visal168.gq", "visal168.ml", "visal168.tk", "visignal.com", "viv2.com", "vixletdev.com", "vixtricks.com", "vjoid.ru", "vjoid.store", "vjuum.com", "vkbb.ru", "vkbb.store", "vkbt.ru", "vkbt.store", "vkcbt.ru", "vkcbt.store", "vkcode.ru", "vkfu.ru", "vkfu.store", "vkpr.store", "vkr1.com", "vkrr.ru", "vkrr.store", "vlemi.com", "vlrregulatory.com", "vmailing.info", "vmani.com", "vmpanda.com", "vn-one.com", "vncctv.org", "vnedu.me", "voidbay.com", "volaj.com", "volku.org", "voltaer.com", "vomoto.com", "vorga.org", "votiputox.org", "voxelcore.com", "voxinh.net", "vpn.st", "vps30.com", "vps911.net", "vradportal.com", "vremonte24-store.ru", "vrmtr.com", "vsimcard.com", "vsmailpro.com", "vssms.com", "vtxmail.us", "vubby.com", "vuiy.pw", "vuket.org", "vulca.sbs", "vusra.com", "vvatxiy.com", "vwhins.com", "vxsolar.com", "vztc.com", "w-asertun.ru", "w3internet.co.uk", "waivey.com", "wakingupesther.com", "walala.org", "walkmail.net", "walkmail.ru", "wallm.com", "wanko.be", "wanva.shop", "watch-harry-potter.com", "watchever.biz", "watchfull.net", "watchironman3onlinefreefullmovie.com", "waterisgone.com", "watrf.com", "wazabi.club", "wbdev.tech", "wbml.net", "web-contact.info", "web-ideal.fr", "web-inc.net", "web-mail.pp.ua", "web2mailco.com", "webcontact-france.eu", "webemail.me", "webhook.site", "webm4il.info", "webmail24.top", "webofip.com", "webscash.com", "webtrip.ch", "webuser.in", "wecp.ru", "wecp.store", "wee.my", "weekfly.com", "wef.gr", "weg-werf-email.de", "wegwerf-email-addressen.de", "wegwerf-email-adressen.de", "wegwerf-email.at", "wegwerf-email.de", "wegwerf-email.net", "wegwerf-emails.de", "wegwerfadresse.de", "wegwerfemail.com", "wegwerfemail.de", "wegwerfemail.info", "wegwerfemail.net", "wegwerfemail.org", "wegwerfemailadresse.com", "wegwerfmail.de", "wegwerfmail.info", "wegwerfmail.net", "wegwerfmail.org", "wegwerpmailadres.nl", "wegwrfmail.de", "wegwrfmail.net", "wegwrfmail.org", "weizixu.com", "wekawa.com", "welikecookies.com", "wellsfargocomcardholders.com", "wemel.top", "wenkuu.com", "wentcity.com", "wep.email", "wetrainbayarea.com", "wetrainbayarea.org", "wfgdfhj.tk", "wg0.com", "wh4f.org", "whaaaaaaaaaat.com", "whatagarbage.com", "whatiaas.com", "whatifanalytics.com", "whatpaas.com", "whatsaas.com", "whiffles.org", "whopy.com", "whyspam.me", "wibblesmith.com", "wickmail.net", "widaryanto.info", "widget.gg", "wiemei.com", "wierie.tk", "wifimaple.com", "wifioak.com", "wikfee.com", "wikidocuslava.ru", "wilemail.com", "willhackforfood.biz", "willselfdestruct.com", "wimsg.com", "winemaven.info", "winocs.com", "wins.com.br", "wir-sind.com", "wireconnected.com", "wishy.fr", "wlist.ro", "wlsom.com", "wmail.cf", "wmail.club", "wnbaldwy.com", "wokcy.com", "wolfmail.ml", "wolfsmail.tk", "wollan.info", "womp-wo.mp", "woopros.com", "workingtall.com", "worldlylife.store", "worldspace.link", "wpdork.com", "wpg.im", "wralawfirm.com", "writeme.us", "wronghead.com", "ws.gy", "wsym.de", "wsypc.com", "wudet.men", "wuespdj.xyz", "wupics.com", "wuuvo.com", "wuzak.com", "wuzup.net", "wuzupmail.net", "wwc8.com", "wwjmp.com", "wwvk.ru", "wwvk.store", "wwwnew.eu", "wxnw.net", "wyoxafp.com", "wywnxa.com", "wzofit.com", "x-lab.net", "x24.com", "xagloo.co", "xagloo.com", "xbaby69.top", "xcode.ro", "xcodes.net", "xcompress.com", "xcoxc.com", "xcpy.com", "xemaps.com", "xemne.com", "xenta.cfd", "xents.com", "xepa.ru", "xfavaj.com", "xidealx.com", "ximenor.site", "xjoi.com", "xkx.me", "xkxkud.com", "xl.cx", "xmailer.be", "xmailtm.com", "xmaily.com", "xn--9kq967o.com", "xn--d-bga.net", "xn--yaho-sqa.com", "xojxe.com", "xost.us", "xoxox.cc", "xperiae5.com", "xrap.de", "xstyled.net", "xvx.us", "xww.ro", "xxhamsterxx.ga", "xxi2.com", "xxl.st", "xxlocanto.us", "xxolocanto.us", "xxqx3802.com", "xxvk.ru", "xxvk.store", "xxxhi.cc", "xy9ce.tk", "xylar.ru", "xylar.store", "xyzfree.net", "xzsok.com", "yabai-oppai.tk", "yabes.ovh", "yahmail.top", "yahooproduct.net", "yamail.win", "yanet.me", "yannmail.win", "yapped.net", "yaqp.com", "yarnpedia.ga", "ycare.de", "ycn.ro", "ye.vc", "yecp.ru", "yecp.store", "yedi.org", "yeezus.ru", "yep.it", "yermail.net", "yhg.biz", "ynmrealty.com", "yodx.ro", "yogamaven.com", "yoggm.com", "yogirt.com", "yomail.edu.pl", "yomail.info", "yoo.ro", "yopmail.com", "yopmail.fr", "yopmail.gq", "yopmail.net", "yopmail.pp.ua", "yordanmail.cf", "you-spam.com", "yougotgoated.com", "youmail.ga", "youmailr.com", "youneedmore.info", "youpymail.com", "your5.ru", "your5.store", "yourdomain.com", "youremail.cf", "yourewronghereswhy.com", "yourlms.biz", "yourspamgoesto.space", "yourtube.ml", "youxiang.dev", "yroid.com", "yspend.com", "ytnhy.com", "ytpayy.com", "yugasandrika.com", "yui.it", "yuki.ren", "yun.pics", "yuoia.com", "yuurok.com", "ywzmb.top", "yxdad.ru", "yxdad.store", "yxzx.net", "yyolf.net", "yzm.de", "z-o-e-v-a.ru", "z0d.eu", "z1p.biz", "z86.ru", "zain.site", "zainmax.net", "zaktouni.fr", "zarabotokdoma11.ru", "zarkbin.store", "zasod.com", "zaym-zaym.ru", "zcovz.ru", "zcovz.store", "zcrcd.com", "zdenka.net", "ze.tc", "zebins.com", "zebins.eu", "zehnminuten.de", "zehnminutenmail.de", "zemzar.net", "zenbyul.com", "zepp.dk", "zeronerbacomail.com", "zetmail.com", "zfymail.com", "zhaoqian.ninja", "zhewei88.com", "zhorachu.com", "zik.dj", "zipcad.com", "zipcatfish.com", "zipo1.gq", "zipsendtest.com", "zira.my", "ziragold.com", "zivox.sbs", "zizo7.com", "zmail.cam", "zoaxe.com", "zoemail.com", "zoemail.net", "zoemail.org", "zoetropes.org", "zombie-hive.com", "zomg.info", "zsero.com", "zudpck.com", "zumpul.com", "zv68.com", "zvvzuv.com", "zx81.ovh", "zxcv.com", "zxcvbnm.com", "zymuying.com", "zyns.com", "zzi.us", "zzrgg.com", "zzz.com"
      ];
      const domain = email.split('@')[1];
      if (disposableDomains.includes(domain)) {
        throw new Error('Disposable email addresses are not allowed.');
      }
      
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address.');
      }
      
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        throw new Error('User already exists with this email');
      }

      const existingUsername = await db.select().from(users).where(eq(users.username, username)).limit(1);
      if (existingUsername.length > 0) {
        throw new Error('Username already taken');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [newUser] = await db.insert(users).values({
        email,
        username,
        password: hashedPassword,
        isVerified: false // User needs to verify email
      }).returning();

      // Generate email verification token
      const verificationToken = generateSecureToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      try {
        // Store verification token in database
        await db.insert(emailVerificationTokens).values({
          userId: newUser.id,
          token: verificationToken,
          expiresAt,
          used: false
        });

        // Send verification email (don't block registration if email fails)
        await EmailService.sendVerificationEmail(email, verificationToken, username);
        console.log('✅ Email verification sent to:', email);
      } catch (emailError) {
        console.error('⚠️ Failed to send verification email:', emailError.message);
      }

      // Also send welcome email
      try {
        await EmailService.sendWelcomeEmail(email, username);
        console.log('✅ Welcome email sent to:', email);
      } catch (emailError) {
        console.error('⚠️ Failed to send welcome email:', emailError.message);
      }

      // Increment signup counter after successful registration
      this.incrementSignupCount(signupInfo);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Login user
  static async login(email, password) {
    try {
      // Validate Gmail requirement for login as well
      if (!email.endsWith('@gmail.com')) {
        throw new Error('Only Gmail addresses (@gmail.com) are supported.');
      }
      
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(id) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
      
      if (!user) {
        throw new Error('User not found');
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Update user preferences
  static async updatePreferences(userId, preferences) {
    try {
      const [updatedUser] = await db.update(users)
        .set({ 
          preferences,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();

      const { password: _, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile (username and avatar only - email cannot be changed)
  static async updateProfile(userId, profileData) {
    try {
      // Don't allow email changes for security reasons
      if (profileData.email) {
        throw new Error('Email cannot be changed. Please contact support if you need to change your email.');
      }

      // If username is being updated, check if it's already taken by another user
      if (profileData.username) {
        const [existingUsername] = await db.select()
          .from(users)
          .where(eq(users.username, profileData.username))
          .limit(1);
        
        if (existingUsername && existingUsername.id !== userId) {
          throw new Error('Username already taken');
        }
      }

      const updateData = {
        ...profileData,
        updatedAt: new Date()
      };

      // Remove email from updateData if it somehow got included
      delete updateData.email;

      // If password is being updated, hash it
      if (profileData.password) {
        updateData.password = await bcrypt.hash(profileData.password, 10);
      }

      const [updatedUser] = await db.update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      const { password: _, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Request password reset
  static async requestPasswordReset(email) {
    try {
      // Validate Gmail requirement
      if (!email.endsWith('@gmail.com')) {
        throw new Error('Only Gmail addresses (@gmail.com) are supported.');
      }
      
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (!user) {
        // Don't reveal if email exists or not for security
        return { success: true, message: 'If an account exists with this email, a password reset link will be sent.' };
      }

      // Generate secure random token (browser-compatible)
      const resetToken = generateSecureToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Save token to database
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token: resetToken,
        expiresAt,
        used: false
      });

      // Send password reset email
      try {
        await EmailService.sendPasswordResetEmail(email, resetToken, user.username);
        console.log('✅ Password reset email sent to:', email);
      } catch (emailError) {
        console.error('⚠️ Failed to send password reset email:', emailError.message);
        // Still return success to user for security (don't reveal email exists)
      }

      return { 
        success: true, 
        message: 'If an account exists with this email, a password reset link will be sent.'
      };
    } catch (error) {
      console.error('❌ Password reset request error:', error);
      throw error;
    }
  }

  // Reset password with token
  static async resetPassword(token, newPassword) {
    try {
      console.log('🔄 Validating password reset token...');

      // Find valid token
      const [tokenRecord] = await db.select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, token),
            eq(passwordResetTokens.used, false),
            gt(passwordResetTokens.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!tokenRecord) {
        throw new Error('Invalid or expired reset token');
      }

      console.log('✅ Token valid for user:', tokenRecord.userId);

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      const [updatedUser] = await db.update(users)
        .set({ 
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(users.id, tokenRecord.userId))
        .returning();

      // Mark token as used
      await db.update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.id, tokenRecord.id));

      // Send notification email about password change
      try {
        await EmailService.sendAccountChangeNotification(
          updatedUser.email,
          updatedUser.username,
          'password'
        );
        console.log('✅ Password change notification sent');
      } catch (emailError) {
        console.error('⚠️ Failed to send notification email:', emailError.message);
      }

      console.log('✅ Password reset successful for user:', updatedUser.username);
      return { success: true, message: 'Password reset successful' };
    } catch (error) {
      console.error('❌ Password reset error:', error);
      throw error;
    }
  }

  // Verify email with token
  static async verifyEmail(token) {
    try {
      console.log('🔄 Validating email verification token...');

      // Find valid token
      const [tokenRecord] = await db.select()
        .from(emailVerificationTokens)
        .where(
          and(
            eq(emailVerificationTokens.token, token),
            eq(emailVerificationTokens.used, false),
            gt(emailVerificationTokens.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!tokenRecord) {
        throw new Error('Invalid or expired verification token');
      }

      console.log('✅ Token valid for user:', tokenRecord.userId);

      // Update user as verified
      const [updatedUser] = await db.update(users)
        .set({ 
          isVerified: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, tokenRecord.userId))
        .returning();

      // Mark token as used
      await db.update(emailVerificationTokens)
        .set({ used: true })
        .where(eq(emailVerificationTokens.id, tokenRecord.id));

      console.log('✅ Email verified successfully for:', updatedUser.email);

      return {
        success: true,
        message: 'Email verified successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          isVerified: updatedUser.isVerified
        }
      };
    } catch (error) {
      console.error('❌ Email verification error:', error);
      throw error;
    }
  }

  // Resend verification email
  static async resendVerificationEmail(email) {
    try {
      console.log('🔄 Resending verification email to:', email);

      // Validate Gmail requirement
      if (!email.endsWith('@gmail.com')) {
        throw new Error('Only Gmail addresses (@gmail.com) are supported.');
      }

      // Find user
      const [user] = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        throw new Error('Email already verified');
      }

      // Generate new verification token
      const verificationToken = generateSecureToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Invalidate old tokens
      await db.update(emailVerificationTokens)
        .set({ used: true })
        .where(eq(emailVerificationTokens.userId, user.id));

      // Store new token
      await db.insert(emailVerificationTokens).values({
        userId: user.id,
        token: verificationToken,
        expiresAt,
        used: false
      });

      // Send verification email
      await EmailService.sendVerificationEmail(user.email, verificationToken, user.username);
      console.log('✅ Verification email resent to:', user.email);

      return {
        success: true,
        message: 'Verification email sent. Please check your inbox.'
      };
    } catch (error) {
      console.error('❌ Resend verification error:', error);
      throw error;
    }
  }

  // Delete user account permanently
  static async deleteAccount(userId, password) {
    try {
      console.log('🔄 Deleting account for user:', userId);

      // Find user
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      // Verify password before deletion
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid password. Account deletion cancelled.');
      }

      // Delete related data first (foreign key constraints)
      console.log('🗑️ Deleting user data for userId:', userId);
      
      // Delete user data tables first (they reference users table)
      try {
        await db.delete(favorites).where(eq(favorites.userId, userId));
        console.log('✅ Favorites deleted');
      } catch (err) {
        console.log('⚠️ No favorites to delete or error:', err.message);
      }
      
      try {
        await db.delete(watchlist).where(eq(watchlist.userId, userId));
        console.log('✅ Watchlist deleted');
      } catch (err) {
        console.log('⚠️ No watchlist to delete or error:', err.message);
      }
      
      try {
        await db.delete(watchHistory).where(eq(watchHistory.userId, userId));
        console.log('✅ Watch history deleted');
      } catch (err) {
        console.log('⚠️ No watch history to delete or error:', err.message);
      }

      // Delete password reset tokens
      await db.delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, userId));
      console.log('✅ Password reset tokens deleted');

      // Delete email verification tokens
      await db.delete(emailVerificationTokens)
        .where(eq(emailVerificationTokens.userId, userId));
      console.log('✅ Email verification tokens deleted');

      // Finally, delete the user
      await db.delete(users)
        .where(eq(users.id, userId));
      console.log('✅ User account deleted');

      console.log('✅ Account deleted successfully:', user.email);

      return {
        success: true,
        message: 'Account deleted successfully. We\'re sorry to see you go!'
      };
    } catch (error) {
      console.error('❌ Account deletion error:', error);
      throw error;
    }
  }
}