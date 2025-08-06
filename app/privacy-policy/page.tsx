/**
 * Privacy Policy Page (GDPR & KVKK Compliant)
 * 
 * Based on a comprehensive template, translated and adapted for HSC.
 */
export default function PrivacyPolicyPage() {
  const lastUpdated = "7 Temmuz 2025";

  // Helper component for section rendering
  const PolicySection = ({ title, children, id }: { title: string, children: React.ReactNode, id: string }) => (
    <div id={id} className="border-t pt-6 mt-6">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="prose prose-lg max-w-none text-gray-700">
        {children}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl bg-white">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">Gizlilik Politikası</h1>
        <p className="text-lg text-gray-600">Son Güncelleme: {lastUpdated}</p>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700">
        <p>
          Bu gizlilik bildirimi, <strong>HSC Ağız ve Diş Sağlığı Merkezi Ticaret Limited Şirketi</strong> ('biz', 'bize', veya 'bizim') için, hizmetlerimizi ('Hizmetler') kullandığınızda bilgilerinizi nasıl ve neden toplayabileceğimizi, saklayabileceğimizi, kullanabileceğimizi ve/veya paylaşabileceğimizi ('işleyebileceğimizi') açıklar. Hizmetlerimiz şunları içerir:
        </p>
        <ul className="list-disc pl-6">
          <li>happysmileclinics.com adresindeki web sitemizi veya bu gizlilik bildirimine bağlanan herhangi bir web sitemizi ziyaret etmeniz</li>
          <li>Happy CRM platformumuzu kullanmanız</li>
          <li>Satış, pazarlama veya etkinlikler dahil olmak üzere bizimle diğer ilgili yollarla etkileşimde bulunmanız</li>
        </ul>
        <p className="mt-4">
          <strong>Sorularınız veya endişeleriniz mi var?</strong> Bu gizlilik bildirimini okumak, gizlilik haklarınızı ve seçeneklerinizi anlamanıza yardımcı olacaktır. Politikalarımızı ve uygulamalarımızı kabul etmiyorsanız, lütfen Hizmetlerimizi kullanmayın. Hala herhangi bir sorunuz veya endişeniz varsa, lütfen bizimle <a href="mailto:privacy@happysmileclinics.com" className="text-blue-600 hover:underline">privacy@happysmileclinics.com</a> adresinden iletişime geçin.
        </p>
      </div>

      <PolicySection id="summary" title="ÖNEMLİ NOKTALARIN ÖZETİ">
        <p><em>Bu özet, gizlilik bildirimimizdeki önemli noktaları sunmaktadır. Daha fazla ayrıntı için lütfen ilgili bölümleri okuyun.</em></p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Hangi kişisel bilgileri işliyoruz?</strong> Hizmetlerimizi kullandığınızda, bizimle nasıl etkileşimde bulunduğunuza bağlı olarak kişisel bilgilerinizi (kimlik, iletişim, sağlık verileri dahil) işleyebiliriz.</li>
          <li><strong>Hassas kişisel bilgi işliyor muyuz?</strong> Evet. Bir sağlık kuruluşu olarak, hizmetlerimizi sunabilmek için KVKK ve GDPR kapsamında hassas nitelikli kişisel veri sayılan sağlık bilgilerinizi işlemekteyiz.</li>
          <li><strong>Bilgilerinizi nasıl işliyoruz?</strong> Bilgilerinizi Hizmetlerimizi sağlamak, iyileştirmek, sizinle iletişim kurmak, güvenliği sağlamak ve yasal yükümlülüklere uymak için işleriz.</li>
          <li><strong>Bilgilerinizi kimlerle paylaşıyoruz?</strong> Bilgilerinizi belirli durumlarda ve belirli üçüncü taraflarla (örneğin, iş ortakları, yasal otoriteler) paylaşabiliriz.</li>
          <li><strong>Haklarınız nelerdir?</strong> Bulunduğunuz coğrafi konuma bağlı olarak, kişisel bilgilerinize ilişkin çeşitli haklara sahipsiniz (erişim, düzeltme, silme vb.).</li>
        </ul>
      </PolicySection>
      
      <PolicySection id="collected_info" title="1. TOPLADIĞIMIZ BİLGİLER">
        <h3>Bize Açıkladığınız Kişisel Bilgiler</h3>
        <p><strong>Kısacası:</strong> Bize gönüllü olarak sağladığınız kişisel bilgileri topluyoruz.</p>
        <p>Hizmetlerimiz hakkında bilgi edinmeye ilgi gösterdiğinizde, Hizmetlerdeki faaliyetlere katıldığınızda veya bizimle başka bir şekilde iletişime geçtiğinizde sağladığınız kişisel bilgileri toplarız. Bu bilgiler şunları içerebilir:</p>
        <ul className="list-disc pl-6">
          <li><strong>Kimlik Bilgileri:</strong> İsim, soyisim, T.C. kimlik numarası, doğum tarihi.</li>
          <li><strong>İletişim Bilgileri:</strong> Telefon numaraları, e-posta adresleri, posta adresleri.</li>
        </ul>
        <h3>Hassas Bilgiler</h3>
        <p>Tıbbi hizmetlerimizi sunmak için, yasalara uygun olarak, sağlık verileriniz gibi hassas bilgilerinizi işliyoruz.</p>
        <p>Bize sağladığınız tüm kişisel bilgilerin doğru, eksiksiz ve güncel olması gerektiğini ve bu tür bilgilerdeki herhangi bir değişikliği bize bildirmeniz gerektiğini unutmayın.</p>
      </PolicySection>

      <PolicySection id="processing_info" title="2. BİLGİLERİNİZİ NASIL İŞLİYORUZ?">
        <p><strong>Kısacası:</strong> Bilgilerinizi Hizmetlerimizi sağlamak, iyileştirmek, sizinle iletişim kurmak, güvenlik ve dolandırıcılığı önlemek ve yasalara uymak için işleriz.</p>
        <p>Kişisel bilgilerinizi, Hizmetlerimizle nasıl etkileşimde bulunduğunuza bağlı olarak çeşitli nedenlerle işleriz, örneğin:</p>
        <ul className="list-disc pl-6">
            <li>Size hizmet sunmak ve tedavi süreçlerinizi yönetmek.</li>
            <li>Randevular ve bilgilendirmeler hakkında sizinle iletişim kurmak.</li>
            <li>Yasal yükümlülüklerimizi yerine getirmek.</li>
        </ul>
      </PolicySection>
      
      <PolicySection id="legal_bases" title="3. BİLGİLERİNİZİ İŞLEMEK İÇİN HANGİ YASAL DAYANAKLARA GÜVENİYORUZ?">
          <p><strong>Kısacası:</strong> Kişisel bilgilerinizi yalnızca gerekli olduğuna inandığımızda ve geçerli yasalar uyarınca onayınız, yasalara uymak, size hizmet sunmak, sözleşmeden doğan yükümlülüklerimizi yerine getirmek, haklarınızı korumak veya meşru ticari çıkarlarımızı yerine getirmek gibi geçerli bir yasal nedenimiz (yani yasal dayanak) olduğunda işleriz.</p>
          <p>Genel Veri Koruma Yönetmeliği (GDPR) ve KVKK, kişisel bilgilerinizi işlemek için güvendiğimiz geçerli yasal dayanakları açıklamamızı gerektirir. Bu nedenle, kişisel bilgilerinizi işlemek için aşağıdaki yasal dayanaklara güvenebiliriz:</p>
          <ul className="list-disc pl-6">
              <li><strong>Rıza:</strong> Kişisel bilgilerinizi belirli bir amaç için kullanmamız için bize izin verdiyseniz (yani rıza) bilgilerinizi işleyebiliriz. Rızanızı istediğiniz zaman geri çekebilirsiniz.</li>
              <li><strong>Yasal Yükümlülükler:</strong> Bir kolluk kuvveti veya düzenleyici kurumla işbirliği yapmak, yasal haklarımızı kullanmak veya savunmak veya dahil olduğumuz davalarda bilgilerinizi delil olarak ifşa etmek gibi yasal yükümlülüklerimize uymak için gerekli olduğuna inandığımız durumlarda bilgilerinizi işleyebiliriz.</li>
              <li><strong>Hayati Menfaatler:</strong> Herhangi bir kişinin güvenliğine yönelik potansiyel tehditler içeren durumlar gibi, hayati menfaatlerinizi veya bir üçüncü tarafın hayati menfaatlerini korumak için gerekli olduğuna inandığımız durumlarda bilgilerinizi işleyebiliriz.</li>
          </ul>
      </PolicySection>

      <PolicySection id="sharing_info" title="4. BİLGİLERİNİZİ NE ZAMAN VE KİMLERLE PAYLAŞIYORUZ?">
          <p><strong>Kısacası:</strong> Bu bölümde açıklanan belirli durumlarda ve/veya aşağıdaki üçüncü taraflarla bilgi paylaşabiliriz.</p>
          <p>Verilerinizi bizim adımıza veya bizim için hizmet sunan ve bu işi yapmak için bu tür bilgilere erişmesi gereken üçüncü taraf satıcılar, hizmet sağlayıcılar, yükleniciler veya aracılarla ('üçüncü taraflar') paylaşabiliriz. Kişisel bilgilerinizi korumaya yardımcı olmak için tasarlanmış sözleşmelerimiz bulunmaktadır.</p>
          <p>Kişisel bilgilerinizi paylaşabileceğimiz durumlar şunlardır:</p>
           <ul className="list-disc pl-6">
              <li><strong>İş Devirleri:</strong> Herhangi bir birleşme, şirket varlıklarının satışı, finansman veya işimizin tamamının veya bir kısmının başka bir şirkete devredilmesiyle bağlantılı olarak veya müzakereler sırasında bilgilerinizi paylaşabilir veya devredebiliriz.</li>
              <li><strong>Reklam ve Pazarlama:</strong> Onayınıza istinaden, reklam, doğrudan pazarlama ve potansiyel müşteri yaratma amacıyla Facebook Kitle Ağı gibi platformlarla bilgi paylaşabiliriz.</li>
          </ul>
      </PolicySection>
      
      <PolicySection id="cookies" title="5. ÇEREZLERİ VE DİĞER İZLEME TEKNOLOJİLERİNİ KULLANIYOR MUYUZ?">
        <p><strong>Kısacası:</strong> Bilgilerinizi toplamak ve saklamak için çerezleri ve diğer izleme teknolojilerini kullanabiliriz.</p>
        <p>Hizmetlerimizle etkileşimde bulunduğunuzda bilgi toplamak için çerezleri ve benzer izleme teknolojilerini (web işaretçileri ve pikseller gibi) kullanabiliriz. Bu teknolojiler, Hizmetlerimizin güvenliğini sağlamamıza, hataları düzeltmemize ve tercihlerinizi kaydetmemize yardımcı olur.</p>
      </PolicySection>

      <PolicySection id="retention" title="6. BİLGİLERİNİZİ NE KADAR SÜRE SAKLIYORUZ?">
        <p><strong>Kısacası:</strong> Bilgilerinizi, bu gizlilik bildiriminde belirtilen amaçları yerine getirmek için gerekli olduğu sürece saklarız, yasalar aksini gerektirmedikçe.</p>
        <p>Kişisel bilgilerinizi işlemek için devam eden meşru bir iş ihtiyacımız olmadığında, bu bilgileri ya sileriz ya da anonim hale getiririz.</p>
      </PolicySection>
      
      <PolicySection id="security" title="7. BİLGİLERİNİZİ NASIL GÜVENDE TUTUYORUZ?">
        <p><strong>Kısacası:</strong> Kişisel bilgilerinizi kurumsal ve teknik güvenlik önlemleri sistemiyle korumayı hedefliyoruz.</p>
        <p>İşlediğimiz tüm kişisel bilgilerin güvenliğini korumak için tasarlanmış uygun ve makul teknik ve kurumsal güvenlik önlemleri uyguladık. Ancak, internet üzerinden hiçbir elektronik iletim veya bilgi depolama teknolojisinin %100 güvenli olduğu garanti edilemez.</p>
      </PolicySection>
      
      <PolicySection id="minors" title="8. REŞİT OLMAYANLARDAN BİLGİ TOPLUYOR MUYUZ?">
          <p><strong>Kısacası:</strong> Bilerek 18 yaşın altındaki çocuklardan veri toplamıyor veya onlara pazarlama yapmıyoruz.</p>
          <p>Hizmetleri kullanarak, en az 18 yaşında olduğunuzu veya böyle bir reşit olmayanın ebeveyni veya vasisi olduğunuzu ve reşit olmayan bakmakla yükümlü olduğunuz kişinin Hizmetleri kullanmasına izin verdiğinizi beyan edersiniz. 18 yaşın altındaki kullanıcılardan kişisel bilgi topladığımızı öğrenirsek, hesabı devre dışı bırakır ve bu tür verileri kayıtlarımızdan derhal silmek için makul önlemleri alırız. 18 yaşın altındaki çocuklardan toplamış olabileceğimiz herhangi bir veriden haberdar olursanız, lütfen bizimle <a href="mailto:privacy@happysmileclinics.com" className="text-blue-600 hover:underline">privacy@happysmileclinics.com</a> adresinden iletişime geçin.</p>
      </PolicySection>

      <PolicySection id="rights" title="9. GİZLİLİK HAKLARINIZ NELERDİR?">
          <p><strong>Kısacası:</strong> Avrupa Ekonomik Alanı (AEA), Birleşik Krallık (BK) ve İsviçre gibi bazı bölgelerde, kişisel bilgilerinize daha fazla erişim ve kontrol sağlayan haklara sahipsiniz. İkamet ettiğiniz ülkeye, ile veya eyalete bağlı olarak hesabınızı istediğiniz zaman inceleyebilir, değiştirebilir veya sonlandırabilirsiniz.</p>
          <p>Bazı bölgelerde (AEA, BK ve İsviçre gibi), geçerli veri koruma yasaları kapsamında belirli haklara sahipsiniz. Bunlar, (i) kişisel bilgilerinize erişim talep etme ve bir kopyasını alma, (ii) düzeltme veya silme talep etme; (iii) kişisel bilgilerinizin işlenmesini kısıtlama; (iv) varsa, veri taşınabilirliği; ve (v) otomatik karar vermeye tabi olmama hakkını içerebilir. Belirli durumlarda, kişisel bilgilerinizin işlenmesine itiraz etme hakkınız da olabilir. Böyle bir talepte bulunmak için aşağıdaki 'BU BİLDİRİM HAKKINDA BİZE NASIL ULAŞABİLİRSİNİZ?' bölümünde verilen iletişim bilgilerini kullanarak bizimle iletişime geçebilirsiniz.</p>
      </PolicySection>

      <PolicySection id="dnt" title="10. 'TAKİP ETME' (DO-NOT-TRACK) ÖZELLİKLERİ İÇİN KONTROLLER">
          <p>Çoğu web tarayıcısı ve bazı mobil işletim sistemleri ve mobil uygulamalar, çevrimiçi gezinme etkinliklerinizle ilgili verilerin izlenmemesi ve toplanmaması konusundaki gizlilik tercihinizi belirtmek için etkinleştirebileceğiniz bir 'Takip Etme' ('DNT') özelliği veya ayarı içerir. Bu aşamada, DNT sinyallerini tanımak ve uygulamak için tek tip bir teknoloji standardı kesinleşmemiştir. Bu nedenle, şu anda DNT tarayıcı sinyallerine veya çevrimiçi olarak izlenmeme seçiminizi otomatik olarak ileten başka bir mekanizmaya yanıt vermiyoruz.</p>
      </PolicySection>

      <PolicySection id="updates" title="11. BU BİLDİRİMDE GÜNCELLEME YAPIYOR MUYUZ?">
        <p><strong>Kısacası:</strong> Evet, ilgili yasalara uyumlu kalmak için bu bildirimi gerektiği gibi güncelleyeceğiz.</p>
        <p>Bu gizlilik bildirimini zaman zaman güncelleyebiliriz. Güncellenmiş sürüm, bu gizlilik bildiriminin üst kısmındaki güncellenmiş 'Revize Edilmiş' tarihi ile belirtilecektir.</p>
      </PolicySection>

      <PolicySection id="contact" title="12. BU BİLDİRİM HAKKINDA BİZE NASIL ULAŞABİLİRSİNİZ?">
          <p>Bu bildirimle ilgili sorularınız veya yorumlarınız varsa, bize posta yoluyla ulaşabilirsiniz:</p>
          <div className="mt-4 p-4 border-l-4">
              <strong>HSC Ağız ve Diş Sağlığı Merkezi Ticaret Limited Şirketi</strong><br/>
              ALTUNİZADE MAH. KISIKLI CAD. SARKUYSAN-AK İŞ MERKEZİ NO: 4/2 İÇ KAPI NO:9<br/>
              ÜSKÜDAR, İSTANBUL<br/>
              Türkiye
          </div>
      </PolicySection>

      <PolicySection id="review" title="13. SİZDEN TOPLADIĞIMIZ VERİLERİ NASIL İNCELEYEBİLİR, GÜNCELLEYEBİLİR VEYA SİLEBİLİRSİNİZ?">
          <p>Sizden topladığımız kişisel bilgilere erişim talep etme, nasıl işlediğimizle ilgili ayrıntıları öğrenme, yanlışlıkları düzeltme veya kişisel bilgilerinizi silme hakkına sahipsiniz. Ayrıca kişisel bilgilerinizi işlememize verdiğiniz onayı geri çekme hakkınız da olabilir. Bu haklar, geçerli yasalarla bazı durumlarda sınırlı olabilir. Kişisel bilgilerinizi inceleme, güncelleme veya silme talebinde bulunmak için lütfen bir veri sahibi erişim talebi doldurup gönderin veya bizimle <a href="mailto:kvkk@happysmileclinics.com" className="text-blue-600 hover:underline">kvkk@happysmileclinics.com</a> adresinden iletişime geçin.</p>
      </PolicySection>
    </div>
  );
}