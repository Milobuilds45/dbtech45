import { NextRequest, NextResponse } from 'next/server';

type Religion = 'christianity' | 'judaism' | 'islam' | 'buddhism' | 'hinduism' | 'sikh' | 'other';

interface PrayerRequest {
  religion: Religion;
  request: string;
}

const RELIGION_CONTEXTS = {
  christianity: 'Christian tradition, drawing from Biblical language and themes, ending with "In Jesus\' name" or "Amen"',
  judaism: 'Jewish tradition, using Hebrew blessings when appropriate, referencing God as Adonai or HaShem',
  islam: 'Islamic tradition, beginning with "Bismillah" when appropriate, using Allah and ending with "Ameen"',
  buddhism: 'Buddhist tradition, focusing on compassion, mindfulness, and the reduction of suffering',
  hinduism: 'Hindu tradition, which may include references to divine names and "Om Shanti"',
  sikh: 'Sikh tradition, referencing Waheguru and emphasizing service, truth, and devotion',
  other: 'universal spiritual tradition that is inclusive and non-denominational'
};

const FALLBACK_PRAYERS: Record<Religion, string> = {
  christianity: "Heavenly Father, we come before You with grateful hearts, seeking Your presence and guidance. Grant us peace in times of trouble, strength in times of weakness, and wisdom in times of uncertainty. May Your love surround us and Your grace sustain us. In Jesus' name we pray, Amen.",
  judaism: "Baruch Atah Adonai, our God, ruler of the universe. We thank You for Your countless blessings and seek Your guidance in our daily lives. Grant us wisdom to walk in Your ways, compassion to care for others, and strength to face life's challenges. May Your peace be upon us and all who seek You. Amen.",
  islam: "Bismillah-ir-Rahman-ir-Rahim. All praise is due to Allah, the Most Compassionate, the Most Merciful. We seek Your guidance and mercy in all our affairs. Grant us patience, wisdom, and the strength to follow the straight path. May Your blessings be upon us and our loved ones. Ameen.",
  buddhism: "May all beings be free from suffering and the causes of suffering. May we find peace within ourselves and extend that peace to all living creatures. Guide us toward wisdom, compassion, and understanding. May our actions bring benefit to ourselves and others on the path to enlightenment.",
  hinduism: "Om Shanti Shanti Shanti. Divine presence that pervades all existence, we seek Your blessings and guidance. Grant us the wisdom to understand our dharma, the strength to fulfill our duties, and the peace that comes from spiritual understanding. May all beings find happiness and liberation.",
  sikh: "Waheguru, the wonderful teacher and source of all light, we bow before Your divine presence. Guide us to live truthfully, serve others selflessly, and remember Your name with devotion. Grant us the strength to face challenges with courage and the wisdom to walk the path of righteousness.",
  other: "Divine presence, however You are known and wherever You are found, we seek Your blessing and guidance. Grant us peace, wisdom, and compassion. Help us to live with integrity, serve others with love, and find meaning in our journey. May all beings know peace and happiness."
};

export async function POST(req: NextRequest) {
  try {
    const { religion, request }: PrayerRequest = await req.json();

    if (!religion || !request) {
      return NextResponse.json(
        { error: 'Religion and request are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      // Return fallback prayer if no API key
      return NextResponse.json({
        prayer: FALLBACK_PRAYERS[religion],
        source: 'fallback'
      });
    }

    const context = RELIGION_CONTEXTS[religion];
    const prompt = `Generate a respectful, authentic prayer in the ${context} for someone who is seeking prayer about: "${request}". 

Guidelines:
- Keep it reverent and theologically appropriate
- Use traditional language and structure for the faith tradition
- Be personal but not overly specific
- Length: 3-6 sentences
- Avoid controversial theological positions
- Focus on comfort, guidance, strength, or gratitude as appropriate`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error('Gemini API request failed');
    }

    const data = await response.json();
    const generatedPrayer = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedPrayer) {
      throw new Error('No prayer generated');
    }

    return NextResponse.json({
      prayer: generatedPrayer.trim(),
      source: 'ai'
    });

  } catch (error) {
    console.error('Prayer generation error:', error);
    
    // Return fallback prayer on any error
    const { religion } = await req.json().catch(() => ({ religion: 'other' }));
    
    return NextResponse.json({
      prayer: FALLBACK_PRAYERS[religion as Religion] || FALLBACK_PRAYERS.other,
      source: 'fallback'
    });
  }
}