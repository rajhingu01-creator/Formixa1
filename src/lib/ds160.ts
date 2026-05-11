// DS-160 question schema and field mapping.
//
// This MVP collects answers in plain English via a multi-step wizard, then asks
// Claude to normalize them into a structured DS-160-shaped object. The keys in
// `Ds160Fields` mirror the section/field naming used by the official US
// Department of State DS-160 ("Online Nonimmigrant Visa Application") form.
//
// The actual DS-160 must be completed online at ceac.state.gov; this app
// generates a print-ready summary PDF the applicant can use to fill it in.

export type QuestionType = "text" | "textarea" | "date" | "select" | "yesno";

export type Question = {
  id: string;
  label: string;
  helper?: string;
  type: QuestionType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
};

export type Section = {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
};

export const SECTIONS: Section[] = [
  {
    id: "personal",
    title: "About you",
    description: "The basics. Match your passport spelling exactly.",
    questions: [
      { id: "surname", label: "Surname / family name (as in passport)", type: "text", required: true, placeholder: "Smith" },
      { id: "given_names", label: "Given names (as in passport)", type: "text", required: true, placeholder: "Jane Marie" },
      { id: "other_names", label: "Have you used any other names? (maiden, religious, professional)", type: "textarea", placeholder: "None, or list each name" },
      { id: "sex", label: "Sex", type: "select", options: ["Female", "Male"], required: true },
      { id: "marital_status", label: "Marital status", type: "select", options: ["Single", "Married", "Common Law Marriage", "Civil Union / Domestic Partnership", "Divorced", "Widowed", "Legally Separated"], required: true },
      { id: "dob", label: "Date of birth", type: "date", required: true },
      { id: "city_of_birth", label: "City of birth", type: "text", required: true },
      { id: "country_of_birth", label: "Country/region of birth", type: "text", required: true },
      { id: "nationality", label: "Country of nationality", type: "text", required: true },
      { id: "national_id", label: "National identification number (if any)", type: "text", placeholder: "Leave blank if none" },
    ],
  },
  {
    id: "passport",
    title: "Passport",
    description: "Pull out your passport and copy it carefully.",
    questions: [
      { id: "passport_number", label: "Passport number", type: "text", required: true },
      { id: "passport_book_number", label: "Passport book number (if any)", type: "text" },
      { id: "passport_country", label: "Country/authority that issued the passport", type: "text", required: true },
      { id: "passport_issue_city", label: "City of issuance", type: "text", required: true },
      { id: "passport_issue_country", label: "Country of issuance", type: "text", required: true },
      { id: "passport_issue_date", label: "Issuance date", type: "date", required: true },
      { id: "passport_expiry_date", label: "Expiration date", type: "date", required: true },
      { id: "passport_lost", label: "Have you ever lost a passport or had one stolen?", type: "yesno" },
    ],
  },
  {
    id: "address",
    title: "Address & contact",
    questions: [
      { id: "home_address", label: "Home street address", type: "textarea", required: true, placeholder: "Street, apt, city, state/province, postal code, country" },
      { id: "phone", label: "Primary phone number (with country code)", type: "text", required: true, placeholder: "+44 20 7946 0018" },
      { id: "email", label: "Email address", type: "text", required: true, placeholder: "you@example.com" },
      { id: "social_media", label: "Social media handles you've used in the past 5 years", type: "textarea", placeholder: "Platform: handle. One per line." },
    ],
  },
  {
    id: "travel",
    title: "Trip plans",
    description: "Tell us about the trip you're applying for.",
    questions: [
      { id: "purpose_of_trip", label: "Purpose of trip", type: "select", options: ["Tourism / Vacation", "Business meetings or conference", "Visit family or friends", "Medical treatment", "Study (short course)", "Transit", "Other"], required: true },
      { id: "purpose_detail", label: "Briefly describe what you'll be doing", type: "textarea", required: true, placeholder: "e.g. Two weeks of sightseeing in NYC and Washington DC." },
      { id: "intended_arrival_date", label: "Intended date of arrival in the US", type: "date", required: true },
      { id: "length_of_stay", label: "How long do you plan to stay?", type: "text", required: true, placeholder: "e.g. 14 days" },
      { id: "us_address", label: "Where will you be staying in the US?", type: "textarea", required: true, placeholder: "Hotel name + address, or host's address" },
      { id: "trip_funded_by", label: "Who is paying for the trip?", type: "select", options: ["Self", "Other person", "Present employer", "Other company/organization"], required: true },
      { id: "previously_visited_us", label: "Have you ever been to the US before?", type: "yesno" },
      { id: "previous_visa", label: "If yes, briefly describe past visits and any prior US visa", type: "textarea", placeholder: "Dates, visa type, length of stay" },
    ],
  },
  {
    id: "companions",
    title: "Travel companions",
    questions: [
      { id: "traveling_with_others", label: "Are you traveling with anyone?", type: "yesno" },
      { id: "companions_detail", label: "If yes, list each companion's name and relationship", type: "textarea", placeholder: "One per line: Name — relationship" },
    ],
  },
  {
    id: "us_contact",
    title: "US point of contact",
    description: "A person or organization in the US who can vouch for you.",
    questions: [
      { id: "us_contact_name", label: "Contact name (or organization)", type: "text", required: true },
      { id: "us_contact_relationship", label: "Relationship to you", type: "select", options: ["Relative", "Spouse", "Friend", "Business Associate", "Employer", "School Official", "Other"], required: true },
      { id: "us_contact_address", label: "Contact address in the US", type: "textarea", required: true },
      { id: "us_contact_phone", label: "Contact phone number", type: "text", required: true },
      { id: "us_contact_email", label: "Contact email", type: "text" },
    ],
  },
  {
    id: "family",
    title: "Family",
    questions: [
      { id: "father_name", label: "Father's full name", type: "text", required: true },
      { id: "father_dob", label: "Father's date of birth", type: "date" },
      { id: "father_in_us", label: "Is your father in the US?", type: "yesno" },
      { id: "mother_name", label: "Mother's full name", type: "text", required: true },
      { id: "mother_dob", label: "Mother's date of birth", type: "date" },
      { id: "mother_in_us", label: "Is your mother in the US?", type: "yesno" },
      { id: "spouse_name", label: "Spouse's full name (if married)", type: "text" },
      { id: "spouse_dob", label: "Spouse's date of birth", type: "date" },
      { id: "spouse_nationality", label: "Spouse's nationality", type: "text" },
    ],
  },
  {
    id: "work_education",
    title: "Work & education",
    questions: [
      { id: "occupation", label: "Current occupation / job title", type: "text", required: true },
      { id: "employer_name", label: "Employer or school name", type: "text", required: true },
      { id: "employer_address", label: "Employer or school address", type: "textarea", required: true },
      { id: "monthly_income", label: "Monthly income in your local currency (approx)", type: "text" },
      { id: "duties", label: "Briefly describe your duties or course of study", type: "textarea", required: true },
      { id: "previous_employer", label: "Most recent prior employer (name and dates)", type: "textarea" },
      { id: "education_history", label: "Highest level of education completed", type: "text" },
    ],
  },
  {
    id: "security",
    title: "Security & background",
    description: "Be honest. Lying on the DS-160 can lead to a permanent ban.",
    questions: [
      { id: "communicable_disease", label: "Do you have any communicable disease of public health significance?", type: "yesno" },
      { id: "criminal_history", label: "Have you ever been arrested or convicted of any offense?", type: "yesno" },
      { id: "drug_use", label: "Have you ever violated any law relating to controlled substances?", type: "yesno" },
      { id: "terrorist_activity", label: "Have you engaged in or do you intend to engage in terrorist activities?", type: "yesno" },
      { id: "previous_visa_refused", label: "Has any US visa ever been denied or revoked?", type: "yesno" },
      { id: "security_explanation", label: "If you answered Yes to any of the above, please explain", type: "textarea", placeholder: "Leave blank if all No" },
    ],
  },
];

export const ALL_QUESTIONS: Question[] = SECTIONS.flatMap((s) =>
  s.questions.map((q) => ({ ...q, section: s.id })),
);

export type Answers = Record<string, string>;

// The structured DS-160 shape Claude returns. Keys mirror the wizard answers
// after light normalization (dates → ISO strings, yes/no → booleans, free text
// trimmed and tidied). The PDF generator reads from this shape.
export type Ds160Fields = {
  personal: {
    surname: string;
    given_names: string;
    full_name: string;
    other_names: string;
    sex: string;
    marital_status: string;
    dob: string;
    city_of_birth: string;
    country_of_birth: string;
    nationality: string;
    national_id: string;
  };
  passport: {
    passport_number: string;
    passport_book_number: string;
    passport_country: string;
    passport_issue_city: string;
    passport_issue_country: string;
    passport_issue_date: string;
    passport_expiry_date: string;
    passport_lost: boolean | null;
  };
  contact: {
    home_address: string;
    phone: string;
    email: string;
    social_media: string;
  };
  travel: {
    purpose_of_trip: string;
    purpose_detail: string;
    intended_arrival_date: string;
    length_of_stay: string;
    us_address: string;
    trip_funded_by: string;
    previously_visited_us: boolean | null;
    previous_visa: string;
  };
  companions: {
    traveling_with_others: boolean | null;
    companions_detail: string;
  };
  us_contact: {
    us_contact_name: string;
    us_contact_relationship: string;
    us_contact_address: string;
    us_contact_phone: string;
    us_contact_email: string;
  };
  family: {
    father_name: string;
    father_dob: string;
    father_in_us: boolean | null;
    mother_name: string;
    mother_dob: string;
    mother_in_us: boolean | null;
    spouse_name: string;
    spouse_dob: string;
    spouse_nationality: string;
  };
  work_education: {
    occupation: string;
    employer_name: string;
    employer_address: string;
    monthly_income: string;
    duties: string;
    previous_employer: string;
    education_history: string;
  };
  security: {
    communicable_disease: boolean | null;
    criminal_history: boolean | null;
    drug_use: boolean | null;
    terrorist_activity: boolean | null;
    previous_visa_refused: boolean | null;
    security_explanation: string;
  };
  warnings: string[];
};
