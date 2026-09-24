import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Fallback alignment when API key is not configured or in case of transient errors
function generateFallbackAlignment(errorReason?: string) {
  return {
    scale: 1.15,
    offsetX: 0,
    offsetY: 0,
    glowColor: '#f59e0b',
    suggestedName: 'Càn Khôn Hộ Thể Khung',
    rarity: 'Cực Phẩm',
    description: 'Khung viền được điêu khắc từ huyền thiết cửu thiên, ôm trọn và hộ vệ tâm thức đạo hữu từ bên ngoài.',
    explanation: errorReason
      ? `Đã sử dụng bộ canh chỉnh tự động cục bộ: Khung viền bao trọn bên ngoài avatar tỉ lệ 1.15x (${errorReason}).`
      : 'Đã tự động xác định tâm đối xứng và căn tỉ lệ 1.15x để khung viền nằm hoàn hảo ở BÊN NGOÀI avatar, avatar sáng rõ bên trong.',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'Missing image payload' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return intelligent fallback if key is not configured yet
      return NextResponse.json(generateFallbackAlignment('Chưa thiết lập GEMINI_API_KEY'));
    }

    // Extract mime type and base64 data
    let mimeType = 'image/png';
    let base64Data = image;

    if (image.startsWith('data:')) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `Bạn là Chuyên gia Đồ họa & AI Canh Chỉnh Avatar Tiên Hiệp.
Hình ảnh đính kèm là một KHUNG VIỀN AVATAR (đã tách nền trong suốt dạng PNG). Khung viền này sẽ được đặt bao bọc ở BÊN NGOÀI một ảnh avatar tròn của người chơi.

Nhiệm vụ của bạn:
1. Phân tích vùng trống tròn ở giữa (aperture/lỗ khuyết trung tâm nơi khuôn mặt avatar người chơi sẽ xuất hiện).
2. Tính toán hệ số phóng đại (scale) tối ưu cho khung viền so với avatar (chuẩn là từ 1.05 đến 1.35, mặc định khoảng 1.15) để khung viền nằm bao bọc hoàn toàn ở BÊN NGOÀI avatar, avatar nằm gọn gàng bên trong tâm khuyết, không bị viền khung ăn lồng vào khuôn mặt.
3. Tính toán độ dịch chuyển tâm offsetX (từ -25 đến +25 pixel) và offsetY (từ -25 đến +25 pixel) nếu lỗ khuyết bị lệch tâm so với tổng thể ảnh.
4. Trích xuất màu phát sáng chủ đạo (glowColor) theo mã hex (ví dụ #f59e0b màu hoàng kim, #10b981 màu ngọc bích, #06b6d4 màu lam băng, #c084fc màu tử lôi, #f43f5e màu chu hỏa).
5. Đặt tên Tiên Hiệp thật hay cho khung viền (suggestedName) phù hợp với hình dáng (Long, Phượng, Bát Quái, Hoa Sen, Kiếm Khí, Lôi Đình, Băng Tinh, Ma Diễm...).
6. Đề xuất phẩm cấp độ hiếm (rarity): "Thượng Phẩm" | "Cực Phẩm" | "Tiên Phẩm" | "Thần Phẩm".
7. Viết mô tả tiên hiệp ngắn gọn (description) khoảng 1-2 câu.
8. Viết giải thích ngắn về cách bạn đã canh chỉnh (explanation), ví dụ: "Đã phát hiện tâm khung viền lệch 1px lên trên, tự động điều chỉnh tỉ lệ 1.16x để khung viền ôm trọn hoàn hảo ở bên ngoài avatar!".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scale: {
              type: Type.NUMBER,
              description: 'Tỉ lệ phóng to tối ưu cho khung viền (từ 1.00 đến 1.35, chuẩn là 1.10 - 1.20 để khung viền bao trọn bên ngoài avatar)',
            },
            offsetX: {
              type: Type.NUMBER,
              description: 'Độ lệch trục ngang X tính bằng pixel (từ -25 đến 25)',
            },
            offsetY: {
              type: Type.NUMBER,
              description: 'Độ lệch trục dọc Y tính bằng pixel (từ -25 đến 25)',
            },
            glowColor: {
              type: Type.STRING,
              description: 'Mã màu hex phát sáng chủ đạo của khung (ví dụ #f59e0b)',
            },
            suggestedName: {
              type: Type.STRING,
              description: 'Tên khung viền tiên hiệp gợi ý',
            },
            rarity: {
              type: Type.STRING,
              description: 'Phẩm cấp: Thượng Phẩm, Cực Phẩm, Tiên Phẩm hoặc Thần Phẩm',
            },
            description: {
              type: Type.STRING,
              description: 'Mô tả nguồn gốc hoặc uy lực của khung viền',
            },
            explanation: {
              type: Type.STRING,
              description: 'Giải thích ngắn về kết quả AI tự động canh chỉnh',
            },
          },
          required: ['scale', 'offsetX', 'offsetY', 'glowColor', 'suggestedName', 'rarity', 'description', 'explanation'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      return NextResponse.json(generateFallbackAlignment('Phản hồi trống từ AI'));
    }

    const data = JSON.parse(text);
    return NextResponse.json({
      scale: typeof data.scale === 'number' ? Math.max(1.1, Math.min(2.0, Number(data.scale.toFixed(2)))) : 1.40,
      offsetX: typeof data.offsetX === 'number' ? Math.max(-40, Math.min(40, Math.round(data.offsetX))) : 0,
      offsetY: typeof data.offsetY === 'number' ? Math.max(-40, Math.min(40, Math.round(data.offsetY))) : 0,
      glowColor: data.glowColor || '#f59e0b',
      suggestedName: data.suggestedName || 'Huyền Kim Khung Viền',
      rarity: data.rarity || 'Cực Phẩm',
      description: data.description || 'Khung viền được tôi luyện từ linh khí thiên địa.',
      explanation: data.explanation || 'AI đã tự động canh chỉnh tâm và tỉ lệ khung viền khớp với avatar!',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi xử lý';
    return NextResponse.json(generateFallbackAlignment(message));
  }
}
