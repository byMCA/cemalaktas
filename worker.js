export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname !== "/api/chat" || request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    if (!env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY tanımlı değil" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    try {
      const body = await request.json();
      const userMessage = body?.message?.trim();

      if (!userMessage) {
        return new Response(JSON.stringify({ error: "Mesaj boş olamaz" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      const systemPrompt = `Sen Cemal Aktaş'ın portfolyo sitesindeki yapay zeka asistanısın.
Görevin, site içeriğine dair soruları yanıtlamaktır: CV, deneyim, projeler, başarılar, sertifikalar, iletişim, eğitim ve GitHub.

Yorumlama kuralları:
- Kullanıcı yazım hatası yapsa da (ör. "kımıdr", "aktas") niyeti anlayıp cevap ver.
- Kullanıcı sorusunu varsayılan olarak Cemal Aktaş ile ilgili yorumla.
- "Neden işe alalım?", "seni neden tercih edelim?", "güçlü yönlerin neler?" gibi soruları da Cemal Aktaş bağlamında cevapla.
- Soru belirsizse önce Cemal Aktaş bağlamında kısa ve faydalı cevap ver; gerekirse netleştirici bir soru ekle.
- Sadece tamamen alakasız, site dışı konularda şu cümleyle kibarca reddet:
  "Üzgünüm, sadece Cemal Aktaş'ın CV'si ve projeleri hakkında soruları yanıtlayabilirim."

Bilgi kaynağın (site içeriği):
- İsim: Cemal Aktaş
- Doğum: 2002, Hatay Reyhanlı
- Alanlar: Siber güvenlik, IT yöneticiliği
- Deneyim: CIO (MCA Ahşap Ambalaj), Ghost Voice, Türkiye Siber Kümelenme, Herevdeyim.com, Herevdeyim
- Öne çıkan projeler: Hadi mobil uygulama, Kali DDos Python, Hadi alışveriş sitesi, ESP Asistan Robot, Mars, ATLAS-AR-Neural-Link
- Başarılar: Shodan zafiyet keşfi, SyberTÜRK CTF derecesi
- GitHub: https://github.com/byMCA

Yanıt stili:
- Kısa, net, profesyonel ve ikna edici.
- İşe alım odaklı sorularda güçlü yönleri somut örneklerle vurgula.
- Kullanıcının yazdığı dili tespit et ve HER ZAMAN aynı dilde yanıt ver.
- Örnek: Soru İngilizceyse yanıt İngilizce, soru Türkçeyse yanıt Türkçe olmalı.
- Bilgi yoksa uydurma: "Bu bilgi sitede yer almıyor" de.`;

      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ]
        })
      });

      const data = await openaiResponse.json();

      return new Response(JSON.stringify(data), {
        status: openaiResponse.status,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Sunucu hatası" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }
};
