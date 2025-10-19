import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faEye, faEyeSlash, faUser, faEnvelope, faLock, faCamera } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import AvatarSelector from './AvatarSelector';
import ForgotPassword from './ForgotPassword';
import PrivacyNotice from './PrivacyNotice';
import { getRandomAvatar } from '../../config/avatars';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(getRandomAvatar());
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleEmailBlur = async () => {
    if (mode === 'register' && formData.email) {
      const error = validateEmail(formData.email);
      if (error) {
        setEmailError(error);
      } else {
        // Clear any previous error
        setEmailError('');
        // Optionally verify email exists on blur (but this might be too aggressive)
        // const verification = await verifyEmailExists(formData.email);
        // if (!verification.valid) {
        //   setEmailError(verification.message);
        // }
      }
    }
  };
  
  // Prevent body scroll when modal is open, but only if child modals are not open
  // Child modals (ForgotPassword, AvatarSelector) handle their own scroll locking
  useBodyScrollLock(isOpen && !isForgotPasswordOpen && !isAvatarSelectorOpen);

  const { login } = useAuth();

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateEmail = (email) => {
    // Only allow Gmail addresses
    if (!email.endsWith('@gmail.com')) {
      return 'Only Gmail addresses (@gmail.com) are allowed for registration.';
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address.';
    }
    
    return null;
  };

  const verifyEmailExists = async (email) => {
    try {
      // For now, we'll use a basic check. In production, you might want to use
      // a service like Hunter.io, NeverBounce, or similar email verification API
      
      // Check if it's a valid Gmail format
      if (!email.includes('@gmail.com')) {
        return { valid: false, message: 'Only Gmail addresses are supported.' };
      }

      // Comprehensive disposable email check
      const disposableDomains = [
        "spambog.net", "spambog.ru", "spambooger.com", "spambox.info", "spambox.me", "spambox.org", "spambox.us", "spamcero.com", "spamcon.org", "spamcorptastic.com", "spamcowboy.com", "spamcowboy.net", "spamcowboy.org", "spamday.com", "spamdecoy.net", "spamex.com", "spamfellas.com", "spamfighter.cf", "spamfighter.ga", "spamfighter.gq", "spamfighter.ml", "spamfighter.tk", "spamfree.eu", "spamfree24.com", "spamfree24.de", "spamfree24.eu", "spamfree24.info", "spamfree24.net", "spamfree24.org", "spamgoes.in", "spamherelots.com", "spamhereplease.com", "spamhole.com", "spamify.com", "spaminator.de", "spamkill.info", "spaml.com", "spaml.de", "spamlot.net", "spammer.fail", "spammotel.com", "spammy.host", "spamobox.com", "spamoff.de", "spamsalad.in", "spamsandwich.com", "spamslicer.com", "spamsphere.com", "spamspot.com", "spamstack.net", "spamthis.co.uk", "spamthis.network", "spamthisplease.com", "spamtrail.com", "spamtrap.ro", "spamtroll.net", "spamwc.cf", "spamwc.ga", "spamwc.gq", "spamwc.ml", "speedgaus.net", "sperma.cf", "spicysoda.com", "spikio.com", "spindl-e.com", "spinly.net", "splitparents.com", "spoofmail.de", "sportrid.com", "spr.io", "spritzzone.de", "spruzme.com", "spybox.de", "spymail.com", "spymail.one", "squizzy.de", "squizzy.net", "sroff.com", "sry.li", "ssoia.com", "sssig.one", "stacys.mom", "stanfordujjain.com", "starlight-breaker.net", "starmail.net", "starpower.space", "startfu.com", "startkeys.com", "statdvr.com", "stathost.net", "statiix.com", "stayhome.li", "steam-area.ru", "steambot.net", "stexsy.com", "stinkefinger.net", "stop-my-spam.cf", "stop-my-spam.com", "stop-my-spam.ga", "stop-my-spam.ml", "stop-my-spam.pp.ua", "stop-my-spam.tk", "stopspam.app", "storegmail.net", "storiqax.top", "storj99.com", "storj99.top", "streetwisemail.com", "stromox.com", "stuckmail.com", "stuffmail.de", "stufmail.com", "stumpfwerk.com", "stylist-volos.ru", "submic.com", "suburbanthug.com", "suckmyd.com", "sudern.de", "sueshaw.com", "suexamplesb.com", "suioe.com", "super-auswahl.de", "superblohey.com", "supergreatmail.com", "supermailer.jp", "superplatyna.com", "superrito.com", "supersave.net", "superstachel.de", "superyp.com", "supporttc.com", "suremail.info", "sute.jp", "svetims.com", "svip520.cn", "svk.jp", "svxr.org", "sweetpotato.ml", "sweetxxx.de", "swift-mail.net", "swift10minutemail.com", "swsdz.com", "syinxun.com", "sylvannet.com", "symphonyresume.com", "synarca.com", "syncax.com", "syosetu.gq", "syujob.accountants", "szerz.com", "tacomail.de", "tafmail.com", "tafoi.gr", "taglead.com", "tagmymedia.com", "tagyourself.com", "taimb.com", "talemarketing.com", "talkinator.com", "talmetry.com", "tanlanav.com", "tanukis.org", "taobudao.com", "tapchicuoihoi.com", "taphear.com", "tapi.re", "tartinemoi.com", "tarzanmail.cf", "tastmemail.com", "tastrg.com", "tatsu.uk", "taugr.com", "taukah.com", "taxibmt.com", "tb-on-line.net", "tbgroupconsultants.com", "tcwlm.com", "tcwlx.com", "tdtda.com", "tech69.com", "techblast.ch", "techemail.com", "techgroup.me", "technoproxy.ru", "techusa.org", "teerest.com", "teewars.org", "tefl.ro", "teihu.com", "telecomix.pl", "teleg.eu", "telegmail.com", "teleworm.com", "teleworm.us", "teligmail.site", "telimail.online", "tellos.xyz", "telvetto.com", "temailz.com", "teml.net", "temp-link.net", "temp-mail.best", "temp-mail.cfd", "temp-mail.com", "temp-mail.de", "temp-mail.now", "temp-mail.org", "temp-mail.pp.ua", "temp-mail.ru", "temp-mails.com", "tempail.com", "tempalias.com", "tempe-mail.com", "tempemail.biz", "tempemail.co.za", "tempemail.com", "tempemail.net", "tempemailgen.com", "tempemaill.com", "tempemailo.org", "tempinbox.co.uk", "tempinbox.com", "tempmail.cn", "tempmail.co", "tempmail.de", "tempmail.email", "tempmail.eu", "tempmail.id.vn", "tempmail.io.vn", "tempmail.it", "tempmail.ninja", "tempmail.plus", "tempmail.pp.ua", "tempmail.us", "tempmail.vip", "tempmail.ws", "tempmail2.com", "tempmaildemo.com", "tempmailer.com", "tempmailer.de", "tempmailer.net", "tempmailfree.net", "tempmailo.com", "tempmails.net", "tempmailyo.org", "tempomail.fr", "tempomail.org", "tempomailo.site", "temporalemail.org", "temporam.com", "temporarily.de", "temporarioemail.com.br", "temporarly.com", "temporary-mail.net", "temporaryemail.net", "temporaryemail.us", "temporaryforwarding.com", "temporaryinbox.com", "temporarymailaddress.com", "tempp-mails.com", "temppppo.store", "tempr.email", "tempsky.com", "temptami.com", "tempthe.net", "tempymail.com", "tensi.org", "tenull.com", "ternaklele.ga", "testore.co", "testudine.com", "tevstart.com", "tgduck.com", "thanksnospam.info", "thankyou2010.com", "thatim.info", "thc.st", "the23app.com", "theaviors.com", "thebearshark.com", "thecarinformation.com", "thecity.biz", "thediamants.org", "thedirhq.info", "theeyeoftruth.com", "thegrampians.net", "thejoker5.com", "thelightningmail.net", "thelimestones.com", "thembones.com.au", "themegreview.com", "themostemail.com", "thereddoors.online", "theroyalweb.club", "thescrappermovie.com", "thespamfather.com", "theteastory.info", "thetechnext.net", "thex.ro", "thichanthit.com", "thietbivanphong.asia", "thirifara.com", "thisisnotmyrealemail.com", "thismail.net", "thisurl.website", "thnikka.com", "thoas.ru", "thraml.com", "thrma.com", "throam.com", "thrott.com", "throwam.com", "throwawayemailaddress.com", "throwawaymail.com", "throwawaymail.pp.ua", "throya.com", "thrubay.com", "thshyo.org", "thunderbolt.science", "thunkinator.org", "thxmate.com", "tiapz.com", "tic.ec", "tidissajiiu.com", "tikanony.com", "tiktakgrab.shop", "tilien.com", "timgiarevn.com", "timkassouf.com", "tinoza.org", "tinytimer.org", "tinyurl24.com", "tipsb.com", "tittbit.in", "tiv.cc", "tizi.com", "tkitc.de", "tlpn.org", "tmail.com", "tmail.edu.rs", "tmail.io", "tmail.link", "tmail.ws", "tmail3.com", "tmail6.com", "tmail9.com", "tmaile.net", "tmailinator.com", "tmails.net", "tmmbt.net", "tmpbox.net", "tmpemails.com", "tmpeml.com", "tmpeml.info", "tmpjr.me", "tmpmail.net", "tmpmail.org", "tmpmailtor.com", "tmpnator.live", "tmpx.sa.com", "tnbeta.com", "toaik.com", "toddsbighug.com", "tofeat.com", "tohru.org", "toiea.com", "tokem.co", "token.ro", "tokenmail.de", "tonaeto.com", "tonne.to", "tonymanso.com", "too.li", "toolbox.ovh", "toolnator.plus", "toomail.biz", "toon.ml", "top-shop-tovar.ru", "top101.de", "top1mail.ru", "top1post.ru", "topdatamaster.com", "topinrock.cf", "topmail2.com", "topmail2.net", "topofertasdehoy.com", "topranklist.de", "toprumours.com", "topvu.net", "tormail.org", "tospage.com", "toss.pw", "tosunkaya.com", "totallynotfake.net", "totalvista.com", "totesmail.com", "totoan.info", "tourcc.com", "tozya.com", "tp-qa-mail.com", "tppp.one", "tppp.online", "tpwlb.com", "tqoai.com", "tqosi.com", "trackden.com", "tradermail.info", "tranceversal.com", "translateid.com", "trap-mail.de", "trash-amil.com", "trash-mail.at", "trash-mail.cf", "trash-mail.com", "trash-mail.de", "trash-mail.ga", "trash-mail.gq", "trash-mail.ml", "trash-mail.tk", "trash-me.com", "trash2009.com", "trash2010.com", "trash2011.com", "trashcanmail.com", "trashdevil.com", "trashdevil.de", "trashemail.de", "trashemails.de", "trashinbox.com", "trashmail.at", "trashmail.com", "trashmail.de", "trashmail.fr", "trashmail.gq", "trashmail.io", "trashmail.me", "trashmail.net", "trashmail.org", "trashmail.se", "trashmail.ws", "trashmailer.com", "trashmailgenerator.de", "trashmails.com", "trashymail.com", "trashymail.net", "trasz.com", "trayna.com", "trbvm.com", "trbvn.com", "trbvo.com", "trend-maker.ru", "trfu.to", "trgfu.com", "trgovinanaveliko.info", "trialmail.de", "trickmail.net", "trillianpro.com", "triots.com", "trixtrux1.ru", "trolebrotmail.com", "trollproject.com", "tropicalbass.info", "tropovenamail.com", "trungtamtoeic.com", "truthfinderlogin.com", "tryalert.com", "tryninja.io", "trythe.net", "tryzoe.com", "tsderp.com", "ttirv.org", "ttszuo.xyz", "tualias.com", "tuamaeaquelaursa.com", "tumroc.net", "tuofs.com", "tupmail.com", "turoid.com", "turual.com", "turuma.com", "tutuapp.bid", "tvchd.com", "tverya.com", "twinmail.de", "twkly.ml", "twocowmail.net", "twoweirdtricks.com", "twzhhq.online", "txcct.com", "txen.de", "txtadvertise.com", "tyhe.ro", "tyldd.com", "tympe.net", "uacro.com", "uber-mail.com", "ubinert.com", "ubismail.net", "ubm.md", "ucche.us", "ucupdong.ml", "uemail99.com", "ufacturing.com", "ufokeuabmail.com", "ug.wtf", "uggsrock.com", "uguuchantele.com", "uhe2.com", "uhhu.ru", "uiemail.com", "uiu.us", "ujijima1129.gq", "uk.to", "ukm.ovh", "ultra.fyi", "ultrada.ru", "uma3.be", "umail.net", "umil.net", "undeadbank.com", "underseagolf.com", "undo.it", "unicodeworld.com", "unids.com", "unimark.org", "uniromax.com", "unit7lahaina.com", "universall.me", "unmail.ru", "unratito.com", "uooos.com", "uorak.com", "upliftnow.com", "uplipht.com", "uploadnolimit.com", "upozowac.info", "upsnab.net", "urfunktion.se", "urhen.com", "uroid.com", "us.af", "us.to", "usa.cc", "usa.edu.pl", "usako.net", "usbc.be", "usdtbeta.com", "used-product.fr", "ushijima1129.cf", "ushijima1129.ga", "ushijima1129.gq", "ushijima1129.ml", "ushijima1129.tk", "usm.ovh", "ustorp.com", "utiket.us", "uu.gl", "uu2.ovh", "uue.edu.pl", "uuf.me", "uuii.in", "uwork4.us", "uyhip.com", "uz8.net", "vaasfc4.tk", "vaati.org", "vafyxh.com", "valanides.com", "valemail.net", "valhalladev.com", "vankin.de", "vasteron.com", "vaupk.org", "vcois.com", "vctel.com", "vda.ro", "vddaz.com", "vdig.com", "veanlo.com", "veb37.com", "veltexline.com", "vemomail.win", "venompen.com", "veo.kr", "ver0.cf", "ver0.ga", "ver0.gq", "ver0.ml", "ver0.tk", "vercelli.cf", "vercelli.ga", "vercelli.gq", "vercelli.ml", "verdejo.com", "vermutlich.net", "vertexium.net", "veruvercomail.com", "veryday.ch", "veryday.eu", "veryday.info", "veryrealemail.com", "ves.ink", "vesa.pw", "vetra.cyou", "vevs.de", "vexi.my", "via.tokyo.jp", "vibzi.net", "vickaentb.tk", "victime.ninja", "victoriaalison.com", "victoriantwins.com", "vidchart.com", "viditag.com", "vidwobox.com", "viewcastmedia.com", "viewcastmedia.net", "viewcastmedia.org", "vigilantkeep.net", "vigoneo.com", "vikingsonly.com", "vinernet.com", "vintomaper.com", "vipepe.com", "vipmail.name", "vipmail.pw", "vips.pics", "vipxm.net", "viralplays.com", "virtualemail.info", "visal007.tk", "visal168.cf", "visal168.ga", "visal168.gq", "visal168.ml", "visal168.tk", "visignal.com", "viv2.com", "vixletdev.com", "vixtricks.com", "vjoid.ru", "vjoid.store", "vjuum.com", "vkbb.ru", "vkbb.store", "vkbt.ru", "vkbt.store", "vkcbt.ru", "vkcbt.store", "vkcode.ru", "vkfu.ru", "vkfu.store", "vkpr.store", "vkr1.com", "vkrr.ru", "vkrr.store", "vlemi.com", "vlrregulatory.com", "vmailing.info", "vmani.com", "vmpanda.com", "vn-one.com", "vncctv.org", "vnedu.me", "voidbay.com", "volaj.com", "volku.org", "voltaer.com", "vomoto.com", "vorga.org", "votiputox.org", "voxelcore.com", "voxinh.net", "vpn.st", "vps30.com", "vps911.net", "vradportal.com", "vremonte24-store.ru", "vrmtr.com", "vsimcard.com", "vsmailpro.com", "vssms.com", "vtxmail.us", "vubby.com", "vuiy.pw", "vuket.org", "vulca.sbs", "vusra.com", "vvatxiy.com", "vwhins.com", "vxsolar.com", "vztc.com", "w-asertun.ru", "w3internet.co.uk", "waivey.com", "wakingupesther.com", "walala.org", "walkmail.net", "walkmail.ru", "wallm.com", "wanko.be", "wanva.shop", "watch-harry-potter.com", "watchever.biz", "watchfull.net", "watchironman3onlinefreefullmovie.com", "waterisgone.com", "watrf.com", "wazabi.club", "wbdev.tech", "wbml.net", "web-contact.info", "web-ideal.fr", "web-inc.net", "web-mail.pp.ua", "web2mailco.com", "webcontact-france.eu", "webemail.me", "webhook.site", "webm4il.info", "webmail24.top", "webofip.com", "webscash.com", "webtrip.ch", "webuser.in", "wecp.ru", "wecp.store", "wee.my", "weekfly.com", "wef.gr", "weg-werf-email.de", "wegwerf-email-addressen.de", "wegwerf-email-adressen.de", "wegwerf-email.at", "wegwerf-email.de", "wegwerf-email.net", "wegwerf-emails.de", "wegwerfadresse.de", "wegwerfemail.com", "wegwerfemail.de", "wegwerfemail.info", "wegwerfemail.net", "wegwerfemail.org", "wegwerfemailadresse.com", "wegwerfmail.de", "wegwerfmail.info", "wegwerfmail.net", "wegwerfmail.org", "wegwerpmailadres.nl", "wegwrfmail.de", "wegwrfmail.net", "wegwrfmail.org", "weizixu.com", "wekawa.com", "welikecookies.com", "wellsfargocomcardholders.com", "wemel.top", "wenkuu.com", "wentcity.com", "wep.email", "wetrainbayarea.com", "wetrainbayarea.org", "wfgdfhj.tk", "wg0.com", "wh4f.org", "whaaaaaaaaaat.com", "whatagarbage.com", "whatiaas.com", "whatifanalytics.com", "whatpaas.com", "whatsaas.com", "whiffles.org", "whopy.com", "whyspam.me", "wibblesmith.com", "wickmail.net", "widaryanto.info", "widget.gg", "wiemei.com", "wierie.tk", "wifimaple.com", "wifioak.com", "wikfee.com", "wikidocuslava.ru", "wilemail.com", "willhackforfood.biz", "willselfdestruct.com", "wimsg.com", "winemaven.info", "winocs.com", "wins.com.br", "wir-sind.com", "wireconnected.com", "wishy.fr", "wlist.ro", "wlsom.com", "wmail.cf", "wmail.club", "wnbaldwy.com", "wokcy.com", "wolfmail.ml", "wolfsmail.tk", "wollan.info", "womp-wo.mp", "woopros.com", "workingtall.com", "worldlylife.store", "worldspace.link", "wpdork.com", "wpg.im", "wralawfirm.com", "writeme.us", "wronghead.com", "ws.gy", "wsym.de", "wsypc.com", "wudet.men", "wuespdj.xyz", "wupics.com", "wuuvo.com", "wuzak.com", "wuzup.net", "wuzupmail.net", "wwc8.com", "wwjmp.com", "wwvk.ru", "wwvk.store", "wwwnew.eu", "wxnw.net", "wyoxafp.com", "wywnxa.com", "wzofit.com", "x-lab.net", "x24.com", "xagloo.co", "xagloo.com", "xbaby69.top", "xcode.ro", "xcodes.net", "xcompress.com", "xcoxc.com", "xcpy.com", "xemaps.com", "xemne.com", "xenta.cfd", "xents.com", "xepa.ru", "xfavaj.com", "xidealx.com", "ximenor.site", "xjoi.com", "xkx.me", "xkxkud.com", "xl.cx", "xmailer.be", "xmailtm.com", "xmaily.com", "xn--9kq967o.com", "xn--d-bga.net", "xn--yaho-sqa.com", "xojxe.com", "xost.us", "xoxox.cc", "xperiae5.com", "xrap.de", "xstyled.net", "xvx.us", "xww.ro", "xxhamsterxx.ga", "xxi2.com", "xxl.st", "xxlocanto.us", "xxolocanto.us", "xxqx3802.com", "xxvk.ru", "xxvk.store", "xxxhi.cc", "xy9ce.tk", "xylar.ru", "xylar.store", "xyzfree.net", "xzsok.com", "yabai-oppai.tk", "yabes.ovh", "yahmail.top", "yahooproduct.net", "yamail.win", "yanet.me", "yannmail.win", "yapped.net", "yaqp.com", "yarnpedia.ga", "ycare.de", "ycn.ro", "ye.vc", "yecp.ru", "yecp.store", "yedi.org", "yeezus.ru", "yep.it", "yermail.net", "yhg.biz", "ynmrealty.com", "yodx.ro", "yogamaven.com", "yoggm.com", "yogirt.com", "yomail.edu.pl", "yomail.info", "yoo.ro", "yopmail.com", "yopmail.fr", "yopmail.gq", "yopmail.net", "yopmail.pp.ua", "yordanmail.cf", "you-spam.com", "yougotgoated.com", "youmail.ga", "youmailr.com", "youneedmore.info", "youpymail.com", "your5.ru", "your5.store", "yourdomain.com", "youremail.cf", "yourewronghereswhy.com", "yourlms.biz", "yourspamgoesto.space", "yourtube.ml", "youxiang.dev", "yroid.com", "yspend.com", "ytnhy.com", "ytpayy.com", "yugasandrika.com", "yui.it", "yuki.ren", "yun.pics", "yuoia.com", "yuurok.com", "ywzmb.top", "yxdad.ru", "yxdad.store", "yxzx.net", "yyolf.net", "yzm.de", "z-o-e-v-a.ru", "z0d.eu", "z1p.biz", "z86.ru", "zain.site", "zainmax.net", "zaktouni.fr", "zarabotokdoma11.ru", "zarkbin.store", "zasod.com", "zaym-zaym.ru", "zcovz.ru", "zcovz.store", "zcrcd.com", "zdenka.net", "ze.tc", "zebins.com", "zebins.eu", "zehnminuten.de", "zehnminutenmail.de", "zemzar.net", "zenbyul.com", "zepp.dk", "zeronerbacomail.com", "zetmail.com", "zfymail.com", "zhaoqian.ninja", "zhewei88.com", "zhorachu.com", "zik.dj", "zipcad.com", "zipcatfish.com", "zipo1.gq", "zipsendtest.com", "zira.my", "ziragold.com", "zivox.sbs", "zizo7.com", "zmail.cam", "zoaxe.com", "zoemail.com", "zoemail.net", "zoemail.org", "zoetropes.org", "zombie-hive.com", "zomg.info", "zsero.com", "zudpck.com", "zumpul.com", "zv68.com", "zvvzuv.com", "zx81.ovh", "zxcv.com", "zxcvbnm.com", "zymuying.com", "zyns.com", "zzi.us", "zzrgg.com", "zzz.com"
      ];
      const domain = email.split('@')[1];
      if (disposableDomains.includes(domain)) {
        return { valid: false, message: 'Disposable email addresses are not allowed.' };
      }

      // Gmail username rules: 6-30 characters, letters, numbers, dots
      if (username.length < 6 || username.length > 30) {
        return { valid: false, message: 'Gmail username must be 6-30 characters long.' };
      }
      
      if (!/^[a-zA-Z0-9.]+$/.test(username)) {
        return { valid: false, message: 'Gmail username can only contain letters, numbers, and dots.' };
      }

      // Additional checks can be added here (API calls to verification services)
      
      return { valid: true, message: 'Email appears to be valid.' };
    } catch (error) {
      console.error('Email verification error:', error);
      return { valid: false, message: 'Unable to verify email at this time.' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Email validation for registration
      if (mode === 'register') {
        const emailError = validateEmail(formData.email);
        if (emailError) {
          throw new Error(emailError);
        }

        // Verify email exists
        const emailVerification = await verifyEmailExists(formData.email);
        if (!emailVerification.valid) {
          throw new Error(emailVerification.message);
        }
      }

      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        const user = await AuthService.register({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          avatar: selectedAvatar.id
        });

        // Update user with avatar preference
        const userWithAvatar = {
          ...user,
          preferences: { ...user.preferences, avatarId: selectedAvatar.id }
        };

        login(userWithAvatar, 'temp_token');
        onClose();
      } else {
        const user = await AuthService.login(formData.email, formData.password);
        login(user, 'temp_token');
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setFormData({ email: '', username: '', password: '', confirmPassword: '' });
    setError('');
    setEmailError('');
    if (mode === 'login') {
      setSelectedAvatar(getRandomAvatar());
    }
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000001] flex items-center justify-center p-4">
        <div className="bg-[#18181B] rounded-2xl w-full max-w-md mx-auto border border-gray-700/50 shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <h2 className="text-2xl font-bold text-white">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xl" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Privacy Notice (Register only) */}
            {mode === 'register' && <PrivacyNotice />}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faEnvelope} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleEmailBlur}
                  required
                  className="w-full bg-[#27272A] border border-gray-600 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter your Gmail address"
                />
              </div>
              {emailError && (
                <p className="text-red-400 text-sm">{emailError}</p>
              )}
              {mode === 'register' && (
                <p className="text-gray-400 text-xs">Only Gmail addresses (@gmail.com) are accepted</p>
              )}
            </div>

            {/* Avatar Selection (Register only) */}
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Profile Avatar</label>
                <div className="flex items-center gap-4">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${selectedAvatar.gradient} flex items-center justify-center relative cursor-pointer group ring-2 ring-gray-600`}
                       onClick={() => setIsAvatarSelectorOpen(true)}>
                    <span className="text-5xl">{selectedAvatar.characterEmoji}</span>
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <FontAwesomeIcon icon={faCamera} className="text-white text-xl" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{selectedAvatar.name}</p>
                    <p className="text-gray-400 text-xs">{selectedAvatar.anime}</p>
                    <button
                      type="button"
                      onClick={() => setIsAvatarSelectorOpen(true)}
                      className="text-blue-400 hover:text-blue-300 text-sm transition-colors mt-1"
                    >
                      Change Avatar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Username (Register only) */}
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Username</label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faUser} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#27272A] border border-gray-600 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Choose a username"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faLock} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#27272A] border border-gray-600 text-white rounded-lg pl-10 pr-12 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {/* Confirm Password (Register only) */}
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faLock} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#27272A] border border-gray-600 text-white rounded-lg pl-10 pr-12 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password Link (Login only) */}
            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            {/* Switch Mode */}
            <div className="text-center pt-4 border-t border-gray-700/50">
              <p className="text-gray-400">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Avatar Selector Modal */}
      {isAvatarSelectorOpen && (
        <AvatarSelector
          currentAvatarId={selectedAvatar.id}
          onSelect={handleAvatarSelect}
          onClose={() => setIsAvatarSelectorOpen(false)}
        />
      )}

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <ForgotPassword
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
          onBackToLogin={() => {
            setIsForgotPasswordOpen(false);
          }}
        />
      )}
    </>
  );
};

export default AuthModal;