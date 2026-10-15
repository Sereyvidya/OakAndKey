export type Lang = "en" | "km";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "km", label: "ខ្មែរ" },
];

/**
 * UI strings. `en` is the source of truth for keys; `km` must define every key
 * (enforced by the type), so a missing translation is a compile error.
 * Khmer copy should be reviewed by a native speaker before wide release.
 */
const en = {
  "nav.about": "About",
  "nav.information": "Information",
  "nav.flyer": "Flyer",
  "nav.captions": "Captions",

  "home.title1": "Less formatting.",
  "home.title2": "More selling.",
  "home.tagline": "One listing. Everything you need to market it.",
  "home.step1.title": "Add listing details",
  "home.step1.body": "Address, price, beds, baths, photos.",
  "home.step2.title": "Choose a flyer style",
  "home.step2.body": "Pick a polished template that fits the home.",
  "home.step3.title": "Generate captions",
  "home.step3.body": "Create ready-to-post marketing copy instantly.",
  "home.cta": "Get Started",

  "form.title": "General Information",
  "form.sample": "Sample",
  "form.fixErrors": "Please fix the highlighted fields below.",
  "form.listingDetails": "Listing Details",
  "form.propTitle": "Title",
  "form.address": "Address",
  "form.state": "State",
  "form.price": "Price (USD)",
  "form.propertyType": "Property Type",
  "form.select": "Select",
  "form.type.house": "House",
  "form.type.condo": "Condo",
  "form.bedrooms": "Bedrooms",
  "form.bathrooms": "Bathrooms",
  "form.size": "Size",
  "form.description": "Description",
  "form.images": "Property Images",
  "form.featured": "Featured",
  "form.agentDetails": "Agent Details",
  "form.agentName": "Name",
  "form.companyName": "Company Name",
  "form.social": "Social / Website",
  "form.phone": "Phone",
  "form.email": "Email",
  "form.companyLogo": "Company Logo",
  "form.agentPhoto": "Agent Photo",
  "form.save": "Save & Continue",
  "form.rewordFailed": "Failed to reword description.",
  "form.descRecommend": "We recommend at least 300 characters.",
  "form.descCount": "{n}/400 characters",
  "form.descLimit": " — limit reached",
  "form.descAlmost": " — almost at limit",
  "form.titleTooLong": "Title must be {n} characters or less for flyers.",
  "file.choose": "Choose File",
  "file.none": "No file chosen",
  "file.noneMany": "No files chosen",
  "file.selected": "{n} file(s) selected",
  "file.clear": "Clear",

  "captions.title": "Social Captions",
  "captions.needData":
    "Add listing details and photos first, then generate caption versions.",
  "captions.goGeneral": "Go to General Info",
  "captions.descAi":
    "Use Gemini to generate 3 caption versions from your listing details and selected photos.",
  "captions.descLocal":
    "Use the local generator to create 3 caption versions from your listing details.",
  "captions.modeLocal": "Local Generator",
  "captions.modeAi": "AI Generator",
  "captions.generate": "Generate",
  "captions.regenerate": "Regenerate",
  "captions.generating": "Generating...",
  "captions.language": "Language",
  "captions.generated": "Generated Captions",
  "captions.versions": "{n} versions",
  "captions.selectPhotos": "Select up to 3 photos",
  "captions.selected": "Selected",
  "captions.select": "Select",
  "captions.copy": "Copy",
  "captions.copied": "Copied",
  "captions.copyFailed": "Copy failed",
  "captions.stats": "{chars} characters · {tags} hashtags",
  "captions.aiFailed": "Failed to generate AI captions.",

  "flyer.builder": "Flyer Builder",
  "flyer.needData":
    "Complete all required fields in General Information to build your flyer.",
  "flyer.residentialOnly": "Residential Templates Only",
  "flyer.residentialBody":
    "Current flyer templates are optimized for residential listings.",
  "flyer.residentialPick":
    "Please select House or Condo in General Information.",
  "flyer.previewNote":
    "Preview scales to your screen. Exports remain 1080×1350.",
  "flyer.template": "Template",
  "flyer.photos": "Photos",
  "flyer.dragHint": "Drag photos to reorder them on the flyer.",
  "flyer.colors": "Colors",
  "flyer.colorsHint": "Choose a color palette or define your own.",
  "flyer.customTheme": "Custom Theme",
  "flyer.presetName": "Preset name",
  "flyer.mainColor": "Main Color",
  "flyer.accentColor": "Accent Color",
  "flyer.background": "Background",
  "flyer.addPreset": "Add Custom Preset",
  "flyer.text": "Text",
  "flyer.textHint": "Adjust wording and font sizes for this template.",
  "flyer.download": "Download",
  "flyer.qr": "QR Code",
  "flyer.qrHint":
    "Optional: Upload your own QR code. Otherwise, the flyer will generate one from your Social / Website link.",

  "err.network":
    "Couldn't reach the server. Check your connection and try again.",
} as const;

export type StringKey = keyof typeof en;

const km: Record<StringKey, string> = {
  "nav.about": "អំពី",
  "nav.information": "ព័ត៌មាន",
  "nav.flyer": "ខិត្តប័ណ្ណ",
  "nav.captions": "អត្ថបទ",

  "home.title1": "កាត់បន្ថយការរៀបចំ។",
  "home.title2": "បង្កើនការលក់។",
  "home.tagline":
    "បញ្ជីអចលនទ្រព្យមួយ។ អ្វីៗទាំងអស់ដែលអ្នកត្រូវការដើម្បីផ្សព្វផ្សាយវា។",
  "home.step1.title": "បញ្ចូលព័ត៌មានអចលនទ្រព្យ",
  "home.step1.body": "អាសយដ្ឋាន តម្លៃ បន្ទប់គេង បន្ទប់ទឹក និងរូបថត។",
  "home.step2.title": "ជ្រើសរើសម៉ូដខិត្តប័ណ្ណ",
  "home.step2.body": "ជ្រើសរើសគំរូស្អាតដែលសមនឹងផ្ទះ។",
  "home.step3.title": "បង្កើតអត្ថបទផុស",
  "home.step3.body": "បង្កើតអត្ថបទផ្សព្វផ្សាយដែលរួចរាល់សម្រាប់ផុសភ្លាមៗ។",
  "home.cta": "ចាប់ផ្តើម",

  "form.title": "ព័ត៌មានទូទៅ",
  "form.sample": "គំរូ",
  "form.fixErrors": "សូមកែតម្រូវវាលដែលបានគូសពណ៌ខាងក្រោម។",
  "form.listingDetails": "ព័ត៌មានអចលនទ្រព្យ",
  "form.propTitle": "ចំណងជើង",
  "form.address": "អាសយដ្ឋាន",
  "form.state": "រដ្ឋ",
  "form.price": "តម្លៃ (ដុល្លារ)",
  "form.propertyType": "ប្រភេទអចលនទ្រព្យ",
  "form.select": "ជ្រើសរើស",
  "form.type.house": "ផ្ទះ",
  "form.type.condo": "ខុនដូ",
  "form.bedrooms": "បន្ទប់គេង",
  "form.bathrooms": "បន្ទប់ទឹក",
  "form.size": "ទំហំ",
  "form.description": "ការពិពណ៌នា",
  "form.images": "រូបថតអចលនទ្រព្យ",
  "form.featured": "ពិសេស",
  "form.agentDetails": "ព័ត៌មានភ្នាក់ងារ",
  "form.agentName": "ឈ្មោះ",
  "form.companyName": "ឈ្មោះក្រុមហ៊ុន",
  "form.social": "បណ្តាញសង្គម / គេហទំព័រ",
  "form.phone": "ទូរស័ព្ទ",
  "form.email": "អ៊ីមែល",
  "form.companyLogo": "និមិត្តសញ្ញាក្រុមហ៊ុន",
  "form.agentPhoto": "រូបថតភ្នាក់ងារ",
  "form.save": "រក្សាទុក និងបន្ត",
  "form.rewordFailed": "មិនអាចសរសេរការពិពណ៌នាឡើងវិញបានទេ។",
  "form.descRecommend": "យើងណែនាំយ៉ាងតិច 300 តួអក្សរ។",
  "form.descCount": "{n}/400 តួអក្សរ",
  "form.descLimit": " — ដល់កំណត់ហើយ",
  "form.descAlmost": " — ជិតដល់កំណត់",
  "form.titleTooLong": "ចំណងជើងត្រូវមិនលើស {n} តួអក្សរសម្រាប់ខិត្តប័ណ្ណ។",
  "file.choose": "ជ្រើសរើសឯកសារ",
  "file.none": "មិនទាន់ជ្រើសរើសឯកសារ",
  "file.noneMany": "មិនទាន់ជ្រើសរើសឯកសារ",
  "file.selected": "បានជ្រើសរើស {n} ឯកសារ",
  "file.clear": "សម្អាត",

  "captions.title": "អត្ថបទបណ្តាញសង្គម",
  "captions.needData":
    "សូមបញ្ចូលព័ត៌មានអចលនទ្រព្យ និងរូបថតជាមុនសិន បន្ទាប់មកបង្កើតអត្ថបទ។",
  "captions.goGeneral": "ទៅកាន់ព័ត៌មានទូទៅ",
  "captions.descAi":
    "ប្រើ Gemini ដើម្បីបង្កើតអត្ថបទ 3 ទម្រង់ ពីព័ត៌មានអចលនទ្រព្យ និងរូបថតដែលបានជ្រើសរើស។",
  "captions.descLocal":
    "ប្រើកម្មវិធីបង្កើតក្នុងម៉ាស៊ីន ដើម្បីបង្កើតអត្ថបទ 3 ទម្រង់ ពីព័ត៌មានអចលនទ្រព្យរបស់អ្នក។",
  "captions.modeLocal": "បង្កើតក្នុងម៉ាស៊ីន",
  "captions.modeAi": "បង្កើតដោយ AI",
  "captions.generate": "បង្កើត",
  "captions.regenerate": "បង្កើតម្តងទៀត",
  "captions.generating": "កំពុងបង្កើត...",
  "captions.language": "ភាសា",
  "captions.generated": "អត្ថបទដែលបានបង្កើត",
  "captions.versions": "{n} ទម្រង់",
  "captions.selectPhotos": "ជ្រើសរើសរូបថតរហូតដល់ 3",
  "captions.selected": "បានជ្រើសរើស",
  "captions.select": "ជ្រើសរើស",
  "captions.copy": "ចម្លង",
  "captions.copied": "បានចម្លង",
  "captions.copyFailed": "ចម្លងមិនបាន",
  "captions.stats": "{chars} តួអក្សរ · {tags} ហាសថេក",
  "captions.aiFailed": "មិនអាចបង្កើតអត្ថបទដោយ AI បានទេ។",

  "flyer.builder": "បង្កើតខិត្តប័ណ្ណ",
  "flyer.needData":
    "សូមបំពេញវាលចាំបាច់ទាំងអស់ក្នុងព័ត៌មានទូទៅ ដើម្បីបង្កើតខិត្តប័ណ្ណ។",
  "flyer.residentialOnly": "គំរូសម្រាប់លំនៅដ្ឋានប៉ុណ្ណោះ",
  "flyer.residentialBody":
    "គំរូខិត្តប័ណ្ណបច្ចុប្បន្នត្រូវបានរចនាឡើងសម្រាប់អចលនទ្រព្យលំនៅដ្ឋាន។",
  "flyer.residentialPick": "សូមជ្រើសរើស ផ្ទះ ឬ ខុនដូ ក្នុងព័ត៌មានទូទៅ។",
  "flyer.previewNote":
    "ការមើលជាមុនតាមទំហំអេក្រង់របស់អ្នក។ ឯកសារទាញយកនៅតែមានទំហំ 1080×1350។",
  "flyer.template": "គំរូ",
  "flyer.photos": "រូបថត",
  "flyer.dragHint": "អូសរូបថតដើម្បីប្តូរលំដាប់នៅលើខិត្តប័ណ្ណ។",
  "flyer.colors": "ពណ៌",
  "flyer.colorsHint": "ជ្រើសរើសក្រុមពណ៌ ឬកំណត់ដោយខ្លួនឯង។",
  "flyer.customTheme": "ពណ៌ផ្ទាល់ខ្លួន",
  "flyer.presetName": "ឈ្មោះក្រុមពណ៌",
  "flyer.mainColor": "ពណ៌ចម្បង",
  "flyer.accentColor": "ពណ៌សង្កត់",
  "flyer.background": "ផ្ទៃខាងក្រោយ",
  "flyer.addPreset": "បន្ថែមក្រុមពណ៌ផ្ទាល់ខ្លួន",
  "flyer.text": "អត្ថបទ",
  "flyer.textHint": "កែសម្រួលពាក្យ និងទំហំអក្សរសម្រាប់គំរូនេះ។",
  "flyer.download": "ទាញយក",
  "flyer.qr": "កូដ QR",
  "flyer.qrHint":
    "ជាជម្រើស៖ ផ្ទុកឡើងកូដ QR ផ្ទាល់ខ្លួនរបស់អ្នក។ បើមិនដូច្នោះទេ ខិត្តប័ណ្ណនឹងបង្កើតមួយពីតំណបណ្តាញសង្គម / គេហទំព័ររបស់អ្នក។",

  "err.network":
    "មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ។ សូមពិនិត្យការតភ្ជាប់ រួចព្យាយាមម្តងទៀត។",
};

export const STRINGS: Record<Lang, Record<StringKey, string>> = { en, km };

export function translate(
  lang: Lang,
  key: StringKey,
  vars?: Record<string, string | number>
): string {
  let text = STRINGS[lang][key] ?? STRINGS.en[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}
