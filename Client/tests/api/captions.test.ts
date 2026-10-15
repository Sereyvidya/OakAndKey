import "./setup";
import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/captions/generate/route";
import { validForm } from "../fixtures";
import {
  geminiBody,
  jsonResponse,
  mockFetchSequence,
  postRequest,
  promptOfCall,
} from "./helpers";

const goodModelOutput = JSON.stringify({
  variants: [
    {
      name: "V1",
      caption: "Welcome home",
      hashtags: ["JustListed"],
      note: "n",
    },
  ],
});
const ok = () => jsonResponse(geminiBody(goodModelOutput));

describe("POST /api/captions/generate", () => {
  it("returns validated variants on success", async () => {
    const fetchMock = mockFetchSequence(ok());

    const res = await POST(postRequest({ formData: validForm, images: [] }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      variants: [
        {
          name: "V1",
          caption: "Welcome home",
          hashtags: ["#JustListed"],
          note: "n",
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("generativelanguage.googleapis.com");
    expect(JSON.parse(String(init!.body)).contents[0].parts[0].text).toContain(
      "Modern 4-Bedroom Family Home"
    );
  });

  it("sends the API key in a header, never in the URL", async () => {
    const fetchMock = mockFetchSequence(ok());
    await POST(postRequest({ formData: validForm }));
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).not.toContain("test-key");
    expect((init!.headers as Record<string, string>)["x-goog-api-key"]).toBe(
      "test-key"
    );
  });

  it("accepts model output wrapped in code fences", async () => {
    mockFetchSequence(
      jsonResponse(geminiBody("```json\n" + goodModelOutput + "\n```"))
    );
    const res = await POST(postRequest({ formData: validForm }));
    expect(res.status).toBe(200);
  });

  it("sends at most 3 data-URL images as inline_data", async () => {
    const fetchMock = mockFetchSequence(ok());
    const images = Array.from({ length: 5 }, (_, i) => ({
      name: `${i}.png`,
      preview: "data:image/png;base64,AAAA",
    }));
    images.push({ name: "bad", preview: "/not-a-data-url.jpg" });

    await POST(postRequest({ formData: validForm, images }));

    const parts = JSON.parse(String(fetchMock.mock.calls[0]![1]!.body))
      .contents[0].parts;
    expect(parts.filter((p: object) => "inline_data" in p)).toHaveLength(3);
  });

  it("rejects a body that is not a JSON object", async () => {
    const fetchMock = mockFetchSequence(ok());
    const res = await POST(
      new Request("http://localhost/api", { method: "POST", body: "nope" })
    );
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("BAD_REQUEST");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails clearly without an API key, and never calls Gemini", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const fetchMock = mockFetchSequence(ok());
    const res = await POST(postRequest({ formData: validForm }));
    expect(res.status).toBe(500);
    expect((await res.json()).code).toBe("MISSING_API_KEY");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/captions/generate: language", () => {
  it("asks for English by default", async () => {
    const fetchMock = mockFetchSequence(ok());
    await POST(postRequest({ formData: validForm }));
    const prompt = promptOfCall(fetchMock, 0);
    expect(prompt).toContain("50-120 words");
    expect(prompt).not.toContain("Khmer");
  });

  it("passes the Khmer language option into the prompt", async () => {
    const fetchMock = mockFetchSequence(ok());
    await POST(postRequest({ formData: validForm, language: "km" }));
    const prompt = promptOfCall(fetchMock, 0);
    expect(prompt).toContain("natural Khmer");
    expect(prompt).toContain("#CambodiaRealEstate");
    expect(prompt).not.toContain("50-120 words");
  });

  it("returns Khmer captions intact", async () => {
    mockFetchSequence(
      jsonResponse(
        geminiBody(
          JSON.stringify({
            variants: [
              {
                name: "ទម្រង់ 1",
                caption: "ផ្ទះថ្មីនៅភ្នំពេញ តម្លៃ $485,000។",
                hashtags: ["RealEstate", "ភ្នំពេញ"],
                note: "រូបថតបន្ទប់ទទួលភ្ញៀវ",
              },
            ],
          })
        )
      )
    );
    const res = await POST(
      postRequest({ formData: validForm, language: "km" })
    );
    const { variants } = await res.json();
    expect(variants[0].caption).toBe("ផ្ទះថ្មីនៅភ្នំពេញ តម្លៃ $485,000។");
    expect(variants[0].hashtags).toEqual(["#RealEstate", "#ភ្នំពេញ"]);
  });

  it("returns error text in Khmer for a Khmer request", async () => {
    mockFetchSequence(jsonResponse({}, 429));
    const res = await POST(
      postRequest({ formData: validForm, language: "km" })
    );
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.code).toBe("RATE_LIMITED");
    expect(json.error).toMatch(/[ក-៿]/);
  });
});
