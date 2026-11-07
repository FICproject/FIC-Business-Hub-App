import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Modal,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  PermissionsAndroid,
  Linking,
  BackHandler,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker, { types as docTypes } from 'react-native-document-picker';

const { width } = Dimensions.get('window');
import { FieldError } from '../../components/common/FieldError';
import { useWalletReferral } from '../../state/WalletReferralContext';
import { notify } from '../../components/common/NotificationContext';

interface RegistrationScreenProps {
  onBackToLogin: () => void;
  onRegistrationComplete: (userData?: {
    fullName: string;
    category: string;
    subCategory: string;
    role: string;
    dob?: string;
    streetAddress?: string;
    stateRegion?: string;
    district?: string;
    city?: string;
    pincode?: string;
    categoryDocNumber?: string;
  }) => void;
}

// 10 Main Categories & Sub-subcategories strictly per the project blueprint MD Section 3.5
export const CATEGORY_OPTIONS: { [key: string]: string[] } = {
  'Business & Entrepreneurship': [
    'Business Owner',
    'Startup Founder',
    'Entrepreneur',
    'Retailer',
    'Wholesaler',
    'Distributor',
    'Trader',
    'Franchise Owner',
    'Business Idea Owner',
  ],
  'Manufacturing & Industrial': [
    'Textile Manufacturer',
    'Garment Manufacturer',
    'Factory Owner',
    'Industrial Supplier',
    'Machinery Manufacturer',
    'Food Processor',
  ],
  'Technology & Digital': [
    'Software Developer',
    'IT Professional',
    'Freelancer',
    'AI Professional',
    'Cybersecurity Specialist',
    'Digital Marketer',
    'Technology Startup',
  ],
  'Education & Knowledge': [
    'Student',
    'Teacher / Professor',
    'Mentor / Trainer',
    'Tutor',
    'Researcher',
    'Educational Consultant',
  ],
  'Professional & Personal Services': [
    'Consultant',
    'Lawyer / Legal Advisor',
    'Chartered Accountant',
    'Architect',
    'Designer',
    'Photographer',
    'Technician / Skilled Professional',
  ],
  'Agriculture & Natural Resources': [
    'Farmer',
    'Landowner',
    'Dairy Producer',
    'Fisheries',
    'Livestock Breeder',
    'Agri-Business Owner',
    'Agri-Consultant',
  ],
  'Investment & Finance': [
    'Investor',
    'Startup Angel Investor',
    'Funding Seeker',
    'Financial Consultant',
    'Investment Professional',
  ],
  'Healthcare & Wellness': [
    'Doctor',
    'Nurse / Care Specialist',
    'Clinic / Hospital Owner',
    'Healthcare Professional',
    'Wellness & Fitness Expert',
  ],
  'Creative, Media & Lifestyle': [
    'Artist',
    'Musician',
    'Actor',
    'Content Creator',
    'Fashion Designer',
    'Event Organizer',
    'Writer / Journalist',
  ],
  'Employment, Community & Social Development': [
    'Job Seeker',
    'Fresher / Graduate',
    'Unemployed Individual',
    'Retired Professional',
    'Volunteer',
    'NGO / Social Worker',
  ],
};

const BUSINESS_TYPES = [
  'Sole Proprietorship',
  'Partnership Firm',
  'Private Limited (Pvt Ltd)',
  'Limited Liability Partnership (LLP)',
  'One Person Company (OPC)',
  'Public Limited',
  'Individual / Freelancer',
  'Trust / Society / NGO',
];

const CITIES = [
  'Mumbai',
  'New Delhi / NCR',
  'Bengaluru',
  'Chennai',
  'Hyderabad',
  'Kolkata',
  'Ahmedabad',
  'Pune',
  'Coimbatore',
  'Jaipur',
  'Surat',
  'Kochi',
  'Indore',
  'Chandigarh',
  'Other City',
];

const STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi NCR',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Other State / UT',
];

const DEFAULT_DISTRICTS = [
  'Central District',
  'North District',
  'South District',
  'East District',
  'West District',
  'Other District',
];

const STATE_DISTRICTS: Record<string, string[]> = {
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
    'Tiruppur', 'Erode', 'Vellore', 'Thanjavur', 'Dindigul', 'Kanchipuram',
    'Chengalpattu', 'Cuddalore', 'Karur', 'Namakkal', 'Thoothukudi', 'Virudhunagar',
    'Sivaganga', 'Krishnagiri', 'Dharmapuri', 'Ramanathapuram', 'Theni', 'Nagapattinam',
    'Tiruvarur', 'Pudukkottai', 'Ariyalur', 'Perambalur', 'Nilgiris', 'Kanyakumari',
    'Tiruvallur', 'Tiruvannamalai', 'Ranipet', 'Tirupathur', 'Kallakurichi', 'Tenkasi',
    'Mayiladuthurai', 'Other District',
  ],
  'Maharashtra': [
    'Mumbai City', 'Mumbai Suburban', 'Pune', 'Nagpur', 'Thane', 'Nashik',
    'Chhatrapati Sambhajinagar', 'Solapur', 'Kolhapur', 'Amravati', 'Nanded',
    'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani',
    'Satara', 'Beed', 'Yavatmal', 'Raigad', 'Palghar', 'Ratnagiri', 'Sindhudurg',
    'Other District',
  ],
  'Karnataka': [
    'Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Belagavi', 'Dharwad / Hubballi',
    'Dakshina Kannada (Mangaluru)', 'Ballari', 'Kalaburagi', 'Vijayapura', 'Shivamogga',
    'Tumakuru', 'Davangere', 'Udupi', 'Hassan', 'Bidar', 'Raichur', 'Chikkamagaluru',
    'Mandya', 'Bagalkote', 'Kolar', 'Chitradurga', 'Koppal', 'Uttara Kannada', 'Other District',
  ],
  'Delhi NCR': [
    'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi',
    'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi',
    'West Delhi', 'Noida / Gautam Buddha Nagar', 'Gurugram', 'Faridabad', 'Ghaziabad',
    'Other District',
  ],
  'Telangana': [
    'Hyderabad', 'Medchal-Malkajgiri', 'Rangareddy', 'Warangal', 'Hanamkonda',
    'Karimnagar', 'Nizamabad', 'Khammam', 'Mahabubnagar', 'Nalgonda',
    'Siddipet', 'Sangareddy', 'Bhadradri Kothagudem', 'Jagtial', 'Mancherial', 'Other District',
  ],
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada (NTR)', 'Guntur', 'Tirupati', 'Kurnool',
    'Nellore', 'Kakinada', 'Anantapur', 'Kadapa (YSR)', 'Chittoor',
    'East Godavari', 'West Godavari', 'Prakasam', 'Srikakulam', 'Vizianagaram', 'Other District',
  ],
  'Kerala': [
    'Thiruvananthapuram', 'Ernakulam (Kochi)', 'Kozhikode', 'Thrissur', 'Kollam',
    'Palakkad', 'Alappuzha', 'Kannur', 'Kottayam', 'Malappuram',
    'Kasaragod', 'Pathanamthitta', 'Idukki', 'Wayanad', 'Other District',
  ],
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar',
    'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Bharuch',
    'Kutch', 'Mehsana', 'Morbi', 'Valsad', 'Navsari', 'Patan', 'Other District',
  ],
  'Uttar Pradesh': [
    'Lucknow', 'Kanpur Nagar', 'Gautam Buddha Nagar (Noida)', 'Ghaziabad', 'Varanasi',
    'Agra', 'Prayagraj (Allahabad)', 'Meerut', 'Bareilly', 'Aligarh',
    'Moradabad', 'Saharanpur', 'Gorakhpur', 'Jhansi', 'Ayodhya', 'Mathura', 'Other District',
  ],
  'West Bengal': [
    'Kolkata', 'North 24 Parganas', 'South 24 Parganas', 'Howrah', 'Hooghly',
    'Darjeeling', 'Paschim Bardhaman', 'Purba Bardhaman', 'Nadia', 'Murshidabad',
    'Malda', 'Jalpaiguri', 'Paschim Medinipur', 'Purba Medinipur', 'Birbhum', 'Other District',
  ],
  'Bihar': [
    'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia',
    'Darbhanga', 'Bihar Sharif (Nalanda)', 'Arrah (Bhojpur)', 'Begusarai', 'Katihar',
    'Munger', 'Chhapra (Saran)', 'Saharsa', 'Samastipur', 'Rohtas', 'Other District',
  ],
  'Rajasthan': [
    'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer',
    'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar',
    'Pali', 'Sri Ganganagar', 'Barmer', 'Chittorgarh', 'Jhunjhunu', 'Other District',
  ],
  'Punjab': [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda',
    'SAS Nagar (Mohali)', 'Hoshiarpur', 'Pathankot', 'Moga', 'Firozpur', 'Other District',
  ],
  'Haryana': [
    'Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar',
    'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Other District',
  ],
  'Madhya Pradesh': [
    'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain',
    'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Singrauli', 'Other District',
  ],
  'Odisha': [
    'Khordha (Bhubaneswar)', 'Cuttack', 'Sundargarh (Rourkela)', 'Ganjam (Berhampur)',
    'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Angul', 'Jharsuguda', 'Other District',
  ],
  'Assam': [
    'Kamrup Metropolitan (Guwahati)', 'Cachar (Silchar)', 'Dibrugarh', 'Jorhat',
    'Nagaon', 'Tinsukia', 'Sonitpur (Tezpur)', 'Barpeta', 'Dhubri', 'Other District',
  ],
  'Chhattisgarh': [
    'Raipur', 'Durg / Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Jagdalpur', 'Raigarh', 'Other District',
  ],
  'Jharkhand': [
    'Ranchi', 'East Singhbhum (Jamshedpur)', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar', 'Other District',
  ],
  'Uttarakhand': [
    'Dehradun', 'Haridwar', 'Udham Singh Nagar', 'Nainital', 'Almora', 'Pauri Garhwal', 'Other District',
  ],
  'Himachal Pradesh': [
    'Shimla', 'Kangra (Dharamshala)', 'Mandi', 'Solan', 'Kullu', 'Sirmaur', 'Hamirpur', 'Other District',
  ],
  'Goa': [
    'North Goa (Panaji)', 'South Goa (Margao)', 'Other District',
  ],
  'Chandigarh': [
    'Chandigarh Central', 'Chandigarh North', 'Chandigarh South', 'Other District',
  ],
  'Jammu & Kashmir': [
    'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 'Udhampur', 'Pulwama', 'Other District',
  ],
};

const TURNOVER_RANGES = [
  'Pre-Revenue / Idea Stage',
  'Under ₹10 Lakhs',
  '₹10 Lakhs – ₹50 Lakhs',
  '₹50 Lakhs – ₹2 Crores',
  '₹2 Crores – ₹10 Crores',
  'Above ₹10 Crores',
];

const INVESTMENT_TICKETS = [
  '₹5 Lakhs – ₹25 Lakhs',
  '₹25 Lakhs – ₹1 Crore',
  '₹1 Crore – ₹5 Crores',
  'Above ₹5 Crores',
];

const INVESTMENT_STAGES = [
  'Pre-Seed / Idea Stage',
  'Early Stage / Seed Funded',
  'Growth Stage / Series A',
  'Expansion / Working Capital Debt',
];

const MENTORING_NEEDS = [
  'Technical & Engineering Mentorship',
  'Startup Incubation & Pitch Review',
  'Career & Industry Guidance',
  'Academic & Research Collaboration',
];

const AVAILABILITY_MODELS = [
  'Full-Time Consulting',
  'Project / Milestone Contract',
  'Technical Advisory Desk',
  'Mentorship / Part-Time',
];

const SUPPLY_CHANNELS = [
  'Mandi / APMC Wholesale',
  'Direct B2B Export',
  'Food Processing & Cold Storage Supply',
  'Organized Retail & Supermarkets',
];

const EXPERIENCE_LEVELS = [
  'Fresher (0 years)',
  '1 – 3 Years',
  '3 – 5 Years',
  '5 – 10 Years',
  '10+ Years',
];

const EDUCATION_LEVEL_OPTIONS = [
  'College / University (Undergraduate)',
  'Postgraduate (Master’s / Ph.D)',
  'Diploma / Polytechnic Student',
  'Higher Secondary / School Student',
];

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// Helper: Age 18+ calculation strictly per Section 11.1
export const parseDateAndValidateAge = (
  dobString: string
): { valid: boolean; age: number; formatted: string; error?: string } => {
  const clean = dobString.replace(/[^0-9]/g, '');
  if (clean.length < 8) {
    return {
      valid: false,
      age: 0,
      formatted: dobString,
      error: 'Please enter a complete date (DD / MM / YYYY)',
    };
  }
  const day = parseInt(clean.substring(0, 2), 10);
  const month = parseInt(clean.substring(2, 4), 10);
  const year = parseInt(clean.substring(4, 8), 10);

  if (month < 1 || month > 12) {
    return {
      valid: false,
      age: 0,
      formatted: dobString,
      error: 'Month must be between 01 and 12',
    };
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return {
      valid: false,
      age: 0,
      formatted: dobString,
      error: `Day must be between 01 and ${daysInMonth} for this month`,
    };
  }

  const currentYear = new Date().getFullYear();
  if (year < 1920 || year > currentYear) {
    return {
      valid: false,
      age: 0,
      formatted: dobString,
      error: `Year must be between 1920 and ${currentYear}`,
    };
  }

  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  const formatted = `${String(day).padStart(2, '0')} / ${String(month).padStart(2, '0')} / ${year}`;
  if (age < 18) {
    return {
      valid: false,
      age,
      formatted,
      error: `Age is ${age}. Per Section 11.1, you must be 18 years or older to register.`,
    };
  }

  return { valid: true, age, formatted };
};

interface AttachedFile {
  name: string;
  size: string;
  sizeBytes?: number;
  type: string;
  source: 'CAMERA' | 'GALLERY' | 'DOCUMENT';
  timestamp: string;
  uri?: string;
  status?: 'Attached' | 'Uploaded';
}

const formatFileSize = (bytes?: number | null): string => {
  if (!bytes || bytes <= 0) return '1.2 MB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({
  onBackToLogin,
  onRegistrationComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Field Errors State for granular inline feedback
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const scrollViewRef = useRef<ScrollView>(null);

  const updateFieldError = (field: string, error: string | null) => {
    setFieldErrors((prev) => {
      if (!error) {
        if (!prev[field]) return prev;
        const copy = { ...prev };
        delete copy[field];
        return copy;
      }
      return { ...prev, [field]: error };
    });
  };

  // Step 1: Basic & Account Details
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [referralCodeInput, setReferralCodeInput] = useState<string>('');

  let registerReferralFunc: ((code: string, newUserName: string, category: string) => any) | null = null;
  try {
    const walletCtx = useWalletReferral();
    registerReferralFunc = walletCtx.registerReferral;
  } catch {
    registerReferralFunc = null;
  }

  // Date Picker Modal State
  const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [pickerYear, setPickerYear] = useState<number>(2000);
  const [pickerMonth, setPickerMonth] = useState<number>(1);
  const [pickerDay, setPickerDay] = useState<number>(15);

  // Step 2: Dynamic Category & Profile Details
  const [businessName, setBusinessName] = useState<string>('');
  const [businessType, setBusinessType] = useState<string>('');
  const [gstin, setGstin] = useState<string>('');
  const [turnover, setTurnover] = useState<string>('');
  const [institutionName, setInstitutionName] = useState<string>('');
  const [degreeCourse, setDegreeCourse] = useState<string>('');
  const [studentIdNumber, setStudentIdNumber] = useState<string>('');
  const [educationLevel, setEducationLevel] = useState<string>('College / University (Undergraduate)');
  const [investmentTicket, setInvestmentTicket] = useState<string>('');
  const [licenseNumber, setLicenseNumber] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [customCity, setCustomCity] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Additional dynamic fields per Section 3.6 of MD Blueprint
  const [skillsOrProducts, setSkillsOrProducts] = useState<string>('');
  const [scaleOrLandholding, setScaleOrLandholding] = useState<string>('');
  const [portfolioUrl, setPortfolioUrl] = useState<string>('');
  const [mentoringNeed, setMentoringNeed] = useState<string>('');
  const [targetInvestmentStage, setTargetInvestmentStage] = useState<string>('');
  const [supplyChannel, setSupplyChannel] = useState<string>('');

  // Common address capture per MD Blueprint Section 2.4 & 3.6
  const [streetAddress, setStreetAddress] = useState<string>('');
  const [stateRegion, setStateRegion] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [customDistrict, setCustomDistrict] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');

  // Step 3: Category document identification number
  const [categoryDocNumber, setCategoryDocNumber] = useState<string>('');

  // Reset helper when Main Category changes
  const resetCategoryFields = () => {
    setSelectedSubCategory('');
    setBusinessName('');
    setBusinessType('');
    setGstin('');
    setTurnover('');
    setInstitutionName('');
    setDegreeCourse('');
    setStudentIdNumber('');
    setEducationLevel('College / University (Undergraduate)');
    setInvestmentTicket('');
    setLicenseNumber('');
    setExperienceLevel('');
    setSkillsOrProducts('');
    setScaleOrLandholding('');
    setPortfolioUrl('');
    setMentoringNeed('');
    setTargetInvestmentStage('');
    setSupplyChannel('');
    setStreetAddress('');
    setStateRegion('');
    setDistrict('');
    setCustomDistrict('');
    setPincode('');
    setCategoryDocNumber('');
    setDescription('');
    setPrimaryDoc(null);
    setCategoryDoc(null);
    setIdNumber('');
    setFieldErrors({});
  };

  // Step 3: Identity Verification & Native Document Handling
  const [verificationMethod, setVerificationMethod] = useState<'AADHAAR' | 'ALTERNATE'>('AADHAAR');
  const [idNumber, setIdNumber] = useState<string>('');
  const [primaryDoc, setPrimaryDoc] = useState<AttachedFile | null>(null);
  const [categoryDoc, setCategoryDoc] = useState<AttachedFile | null>(null);
  const [docPickerVisible, setDocPickerVisible] = useState<boolean>(false);
  const [docPickerTarget, setDocPickerTarget] = useState<'PRIMARY' | 'CATEGORY'>('PRIMARY');
  const [previewModalVisible, setPreviewModalVisible] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<AttachedFile | null>(null);
  const [previewDocTitle, setPreviewDocTitle] = useState<string>('');

  // Step 4: Membership Payment
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING'>('UPI');
  const [agreedTerms, setAgreedTerms] = useState<boolean>(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);

  // Picker Modal State
  const [pickerModalVisible, setPickerModalVisible] = useState<boolean>(false);
  const [pickerTitle, setPickerTitle] = useState<string>('');
  const [pickerOptions, setPickerOptions] = useState<string[]>([]);
  const [onSelectOption, setOnSelectOption] = useState<(val: string) => void>(() => () => {});

  const openPicker = (title: string, options: string[], callback: (val: string) => void) => {
    setPickerTitle(title);
    setPickerOptions(options);
    setOnSelectOption(() => (val: string) => {
      callback(val);
      setPickerModalVisible(false);
    });
    setPickerModalVisible(true);
  };

  // Android System Back Button & Gesture Handling
  useEffect(() => {
    const handleHardwareBack = () => {
      // 1. Close preview modal if open
      if (previewModalVisible) {
        setPreviewModalVisible(false);
        return true;
      }
      // 2. Close document picker sheet if open
      if (docPickerVisible) {
        setDocPickerVisible(false);
        return true;
      }
      // 3. Close generic dropdown picker if open
      if (pickerModalVisible) {
        setPickerModalVisible(false);
        return true;
      }
      // 4. Close DOB date picker if open
      if (datePickerVisible) {
        setDatePickerVisible(false);
        return true;
      }
      // 5. Navigate backwards through registration steps
      if (currentStep > 1) {
        setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
        return true;
      }
      // 6. At Step 1, return to login screen
      onBackToLogin();
      return true;
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
    return () => backSub.remove();
  }, [
    previewModalVisible,
    docPickerVisible,
    pickerModalVisible,
    datePickerVisible,
    currentStep,
    onBackToLogin,
  ]);

  // Category & Subcategory Detection Flags strictly conforming to MD Blueprint
  const isEducation = selectedCategory === 'Education & Knowledge';
  const isStudent = isEducation && selectedSubCategory === 'Student';
  const isTechnology = selectedCategory === 'Technology & Digital';
  const isInvestment = selectedCategory === 'Investment & Finance';
  const isProfessional = selectedCategory === 'Professional & Personal Services';
  const isHealthcare = selectedCategory === 'Healthcare & Wellness';
  const isAgriculture = selectedCategory === 'Agriculture & Natural Resources';
  const isCreative = selectedCategory === 'Creative, Media & Lifestyle';
  const isEmploymentSocial = selectedCategory === 'Employment, Community & Social Development';
  const isManufacturing = selectedCategory === 'Manufacturing & Industrial';
  const isBusiness = selectedCategory === 'Business & Entrepreneurship';
  const isCollegeStudent = isStudent && !educationLevel.includes('School');

  // Real-time Text Input Sanitizers & Handlers

  // 1. Full Name: Text-only (no numbers or unwanted special characters)
  const handleFullNameChange = (text: string) => {
    const sanitized = text.replace(/[^a-zA-Z\s.'-]/g, '');
    setFullName(sanitized);
    if (!sanitized.trim()) {
      updateFieldError('fullName', 'Full name is required');
    } else if (sanitized.trim().length < 2) {
      updateFieldError('fullName', 'Full name must contain at least 2 letters');
    } else {
      updateFieldError('fullName', null);
    }
  };

  // 2. Email: Format validation
  const handleEmailChange = (text: string) => {
    const trimmed = text.trim();
    setEmail(trimmed);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmed) {
      updateFieldError('email', 'Official email is required');
    } else if (!emailRegex.test(trimmed)) {
      updateFieldError('email', 'Please enter a valid email address (e.g. name@domain.com)');
    } else {
      updateFieldError('email', null);
    }
  };

  // 3. Mobile Number: Number-only (strictly 10 digits starting with 6-9)
  const handleMobileChange = (text: string) => {
    const sanitized = text.replace(/[^0-9]/g, '');
    setMobile(sanitized);
    if (!sanitized) {
      updateFieldError('mobile', 'Mobile number is required');
    } else if (sanitized.length > 0 && !/^[6-9]/.test(sanitized)) {
      updateFieldError('mobile', 'Mobile number must begin with 6, 7, 8, or 9');
    } else if (sanitized.length < 10) {
      updateFieldError('mobile', 'Mobile number must be exactly 10 digits');
    } else {
      updateFieldError('mobile', null);
    }
  };

  // 4. Date of Birth: Format + 18+ age requirement
  const handleDobChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    let formattedText = clean;
    if (clean.length > 4) {
      formattedText = `${clean.slice(0, 2)} / ${clean.slice(2, 4)} / ${clean.slice(4, 8)}`;
    } else if (clean.length > 2) {
      formattedText = `${clean.slice(0, 2)} / ${clean.slice(2)}`;
    }
    setDob(formattedText);

    if (clean.length === 8) {
      const check = parseDateAndValidateAge(formattedText);
      if (!check.valid) {
        updateFieldError('dob', check.error || 'Must be 18 years or older');
      } else {
        updateFieldError('dob', null);
      }
    } else if (clean.length > 0 && clean.length < 8) {
      updateFieldError('dob', 'Enter complete date (DD / MM / YYYY) or tap picker');
    } else {
      updateFieldError('dob', null);
    }
  };

  // Open Date Picker Modal with current or default date
  const handleOpenDatePicker = () => {
    const clean = dob.replace(/[^0-9]/g, '');
    if (clean.length >= 8) {
      const d = parseInt(clean.substring(0, 2), 10);
      const m = parseInt(clean.substring(2, 4), 10);
      const y = parseInt(clean.substring(4, 8), 10);
      if (d >= 1 && d <= 31) setPickerDay(d);
      if (m >= 1 && m <= 12) setPickerMonth(m);
      if (y >= 1940 && y <= 2008) setPickerYear(y);
    }
    setDatePickerVisible(true);
  };

  // Confirm Date from Picker Modal
  const handleConfirmDatePicker = () => {
    const daysInSelectedMonth = new Date(pickerYear, pickerMonth, 0).getDate();
    const safeDay = Math.min(pickerDay, daysInSelectedMonth);
    const formatted = `${String(safeDay).padStart(2, '0')} / ${String(pickerMonth).padStart(2, '0')} / ${pickerYear}`;
    setDob(formatted);
    const check = parseDateAndValidateAge(formatted);
    if (!check.valid) {
      updateFieldError('dob', check.error || 'Must be 18+ to register');
    } else {
      updateFieldError('dob', null);
    }
    setDatePickerVisible(false);
  };

  // 5. Passwords
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (!text) {
      updateFieldError('password', 'Password is required');
    } else if (text.length < 6) {
      updateFieldError('password', 'Password must be at least 6 characters');
    } else {
      updateFieldError('password', null);
      if (confirmPassword && text !== confirmPassword) {
        updateFieldError('confirmPassword', 'Passwords do not match');
      } else if (confirmPassword && text === confirmPassword) {
        updateFieldError('confirmPassword', null);
      }
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (!text) {
      updateFieldError('confirmPassword', 'Please re-enter your password');
    } else if (text !== password) {
      updateFieldError('confirmPassword', 'Passwords do not match');
    } else {
      updateFieldError('confirmPassword', null);
    }
  };

  // Step 2 Alphanumeric Handlers
  const handleAlphanumericChange = (
    setter: (val: string) => void,
    fieldKey: string,
    text: string,
    minLen: number = 2,
    fieldName: string = 'Field'
  ) => {
    // Alphanumeric with permitted punctuation: letters, numbers, spaces, dots, commas, hyphens, ampersands, slashes, apostrophes, parentheses
    const sanitized = text.replace(/[^a-zA-Z0-9\s.,&'/\-()]/g, '');
    setter(sanitized);
    if (!sanitized.trim()) {
      updateFieldError(fieldKey, `${fieldName} is required`);
    } else if (sanitized.trim().length < minLen) {
      updateFieldError(fieldKey, `${fieldName} must be at least ${minLen} characters`);
    } else {
      updateFieldError(fieldKey, null);
    }
  };

  // Postal PIN Code: Strictly 6 digits
  const handlePincodeChange = (text: string) => {
    const sanitized = text.replace(/[^0-9]/g, '');
    setPincode(sanitized);
    if (!sanitized) {
      updateFieldError('pincode', 'Postal PIN code is required');
    } else if (!/^[1-9]/.test(sanitized)) {
      updateFieldError('pincode', 'PIN code cannot start with 0');
    } else if (sanitized.length < 6) {
      updateFieldError('pincode', 'PIN code must be exactly 6 digits');
    } else {
      updateFieldError('pincode', null);
    }
  };

  // Optional GSTIN / Udyam Number
  const handleGstinChange = (text: string) => {
    const sanitized = text.toUpperCase().replace(/[^a-zA-Z0-9\-]/g, '');
    setGstin(sanitized);
    if (!sanitized) {
      updateFieldError('gstin', null);
      return;
    }
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const udyamRegex = /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/;
    if (sanitized.length >= 15 && (gstinRegex.test(sanitized) || udyamRegex.test(sanitized))) {
      updateFieldError('gstin', null);
    } else if (sanitized.length < 15) {
      updateFieldError('gstin', 'Enter 15-character GSTIN or UDYAM-XX-00-0000000');
    } else {
      updateFieldError('gstin', 'Invalid GSTIN / Udyam format');
    }
  };

  // Step 3 ID Number Handler
  const handleIdNumberChange = (text: string) => {
    if (verificationMethod === 'AADHAAR') {
      const sanitized = text.replace(/[^0-9]/g, '');
      setIdNumber(sanitized);
      if (!sanitized) {
        updateFieldError('idNumber', 'Aadhaar number is required');
      } else if (sanitized.length !== 12) {
        updateFieldError('idNumber', 'Aadhaar number must be exactly 12 digits');
      } else {
        updateFieldError('idNumber', null);
      }
    } else {
      const sanitized = text.toUpperCase().replace(/[^a-zA-Z0-9]/g, '');
      setIdNumber(sanitized);
      if (!sanitized) {
        updateFieldError('idNumber', 'Govt ID / PAN number is required');
      } else if (sanitized.length < 8) {
        updateFieldError('idNumber', 'ID number must be at least 8 alphanumeric characters');
      } else {
        updateFieldError('idNumber', null);
      }
    }
  };

  // Step 1 Validation & Proceed
  const handleNextFromStep1 = () => {
    const errors: Record<string, string> = {};

    if (!selectedCategory) {
      errors.category = 'Please select your Main Category.';
    }
    if (!selectedSubCategory) {
      errors.subCategory = 'Please select your Subcategory.';
    }
    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Please enter your Full Name (letters only, min 2 characters)';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid official email address';
    }
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length !== 10 || !/^[6-9]/.test(cleanMobile)) {
      errors.mobile = 'Please enter a valid 10-digit mobile number starting with 6-9';
    }
    const ageResult = parseDateAndValidateAge(dob);
    if (!ageResult.valid) {
      errors.dob = ageResult.error || 'Per Section 11.1, members must be 18 years or older';
    }
    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setFieldErrors({});
    setCurrentStep(2);
  };

  // Step 2 Validation & Proceed
  const handleNextFromStep2 = () => {
    const errors: Record<string, string> = {};

    // Dynamic Category Validation
    if (isEducation) {
      if (isStudent) {
        if (!institutionName.trim() || institutionName.trim().length < 2) {
          errors.institutionName = isCollegeStudent
            ? 'College / University name is required'
            : 'School / Institution name is required';
        }
        if (!degreeCourse.trim() || degreeCourse.trim().length < 2) {
          errors.degreeCourse = isCollegeStudent
            ? 'Degree / Major course is required'
            : 'Academic grade is required';
        }
        if (isCollegeStudent && (!studentIdNumber.trim() || studentIdNumber.trim().length < 2)) {
          errors.studentIdNumber = 'Student / College ID Roll Number is required';
        }
        if (!skillsOrProducts.trim() || skillsOrProducts.trim().length < 2) {
          errors.skillsOrProducts = 'Primary skills and career interests are required';
        }
        if (!mentoringNeed) {
          errors.mentoringNeed = 'Please select your mentoring guidance priority';
        }
      } else {
        if (!institutionName.trim() || institutionName.trim().length < 2) {
          errors.institutionName = 'Academy / University name is required';
        }
        if (!degreeCourse.trim() || degreeCourse.trim().length < 2) {
          errors.degreeCourse = 'Designation and department are required';
        }
        if (!skillsOrProducts.trim() || skillsOrProducts.trim().length < 2) {
          errors.skillsOrProducts = 'Specialization area is required';
        }
        if (!experienceLevel) {
          errors.experienceLevel = 'Please select teaching / mentoring experience';
        }
      }
    } else if (isTechnology) {
      if (!businessName.trim() || businessName.trim().length < 2) {
        errors.businessName = 'Professional or practice name is required';
      }
      if (!skillsOrProducts.trim() || skillsOrProducts.trim().length < 2) {
        errors.skillsOrProducts = 'Core technology stack and skills are required';
      }
      if (!experienceLevel) {
        errors.experienceLevel = 'Please select experience level';
      }
      if (!mentoringNeed) {
        errors.mentoringNeed = 'Please select availability model';
      }
    } else if (isInvestment) {
      if (!businessName.trim() || businessName.trim().length < 2) {
        errors.businessName = 'Investment entity / fund name is required';
      }
      if (!investmentTicket) {
        errors.investmentTicket = 'Please select preferred investment ticket range';
      }
      if (!targetInvestmentStage) {
        errors.targetInvestmentStage = 'Please select target business stage';
      }
      if (!skillsOrProducts.trim() || skillsOrProducts.trim().length < 2) {
        errors.skillsOrProducts = 'Preferred industry sectors are required';
      }
    } else if (isProfessional || isHealthcare) {
      if (!businessName.trim() || businessName.trim().length < 2) {
        errors.businessName = 'Practice, clinic, or firm name is required';
      }
      if (!degreeCourse.trim() || degreeCourse.trim().length < 2) {
        errors.degreeCourse = 'Professional specialization is required';
      }
      if (!experienceLevel) {
        errors.experienceLevel = 'Please select years of practice';
      }
    } else if (isAgriculture) {
      if (!businessName.trim() || businessName.trim().length < 2) {
        errors.businessName = 'Farm or agri-business name is required';
      }
      if (!scaleOrLandholding.trim() || scaleOrLandholding.trim().length < 2) {
        errors.scaleOrLandholding = 'Cultivation scale or landholding is required';
      }
      if (!skillsOrProducts.trim() || skillsOrProducts.trim().length < 2) {
        errors.skillsOrProducts = 'Primary crops or produce are required';
      }
      if (!supplyChannel) {
        errors.supplyChannel = 'Please select primary supply channel';
      }
    } else if (isEmploymentSocial) {
      if (!businessName.trim() || businessName.trim().length < 2) {
        errors.businessName = 'Target role, organization, or NGO name is required';
      }
      if (!degreeCourse.trim() || degreeCourse.trim().length < 2) {
        errors.degreeCourse = 'Highest educational qualification is required';
      }
      if (!skillsOrProducts.trim() || skillsOrProducts.trim().length < 2) {
        errors.skillsOrProducts = 'Core functional skills are required';
      }
      if (!experienceLevel) {
        errors.experienceLevel = 'Please select total experience level';
      }
    } else if (isCreative) {
      if (!businessName.trim() || businessName.trim().length < 2) {
        errors.businessName = 'Studio, brand, or professional handle is required';
      }
      if (!degreeCourse.trim() || degreeCourse.trim().length < 2) {
        errors.degreeCourse = 'Creative medium or discipline is required';
      }
      if (!experienceLevel) {
        errors.experienceLevel = 'Please select experience level';
      }
    } else {
      // Manufacturing & Commercial
      if (!businessName.trim() || businessName.trim().length < 2) {
        errors.businessName = 'Business, factory, or company name is required';
      }
      if (!businessType) {
        errors.businessType = 'Please select business entity type';
      }
      if (!skillsOrProducts.trim() || skillsOrProducts.trim().length < 2) {
        errors.skillsOrProducts = 'Key products and batch capacity are required';
      }
      if (!experienceLevel) {
        errors.experienceLevel = 'Please select years in operation';
      }
    }

    // Common Address Validation (Section 2.4 & 3.6 of MD Blueprint)
    if (!streetAddress.trim() || streetAddress.trim().length < 5) {
      errors.streetAddress = 'Street address must be at least 5 characters (alphanumeric)';
    }

    if (!stateRegion) {
      errors.stateRegion = 'Please select your state';
    }

    if (!district) {
      errors.district = 'Please select your district';
    } else if (district === 'Other District' && (!customDistrict.trim() || customDistrict.trim().length < 2)) {
      errors.customDistrict = 'Please enter your district name (min 2 characters)';
    }

    if (!city.trim() || city.trim().length < 2) {
      errors.city = 'Please enter your city name (letters only, min 2 characters)';
    }

    const cleanPincode = pincode.replace(/[^0-9]/g, '');
    if (cleanPincode.length !== 6 || !/^[1-9]/.test(cleanPincode)) {
      errors.pincode = 'Please enter a valid 6-digit postal PIN Code';
    }

    // Auto sync studentIdNumber to categoryDocNumber if entered
    if (studentIdNumber && !categoryDocNumber) {
      setCategoryDocNumber(studentIdNumber);
    }

    if (!description.trim() || description.trim().length < 10) {
      errors.description = 'Please provide a brief description (at least 10 characters)';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setFieldErrors({});
    setCurrentStep(3);
  };

  // Step 3 Validation with Category-Specific KYC Enforcement
  const handleNextFromStep3 = () => {
    const errors: Record<string, string> = {};

    if (!idNumber.trim()) {
      errors.idNumber =
        verificationMethod === 'AADHAAR'
          ? 'Please enter your 12-digit Aadhaar Number'
          : 'Please enter your Govt ID / PAN number';
    } else if (verificationMethod === 'AADHAAR' && idNumber.replace(/[^0-9]/g, '').length !== 12) {
      errors.idNumber = 'Aadhaar number must be exactly 12 digits';
    } else if (verificationMethod === 'ALTERNATE' && idNumber.trim().length < 8) {
      errors.idNumber = 'Govt ID / PAN must be at least 8 alphanumeric characters';
    }

    if (!primaryDoc) {
      errors.primaryDoc =
        verificationMethod === 'AADHAAR'
          ? 'Masked Aadhaar Card proof document is required'
          : 'Official Govt ID / PAN document proof is required';
    }

    // Dynamic Category Mandatory Document & Number Verification per MD blueprint
    if (isCategoryDocRequired()) {
      const cleanDocNum = categoryDocNumber.replace(/[^a-zA-Z0-9\-_/]/g, '').trim();
      if (!cleanDocNum || cleanDocNum.length < 3) {
        errors.categoryDocNumber = getCategoryDocNumberConfig().errorMsg;
      }
      if (!categoryDoc) {
        if (isStudent && isCollegeStudent) {
          errors.categoryDoc = 'Student / College ID Card proof is mandatory';
        } else if (isEducation && !isStudent) {
          errors.categoryDoc = 'Academic Degree / Experience Proof is mandatory';
        } else if (isManufacturing || isBusiness) {
          errors.categoryDoc = 'GSTIN, Udyam, or Business Certificate is mandatory';
        } else if (isInvestment) {
          errors.categoryDoc = 'Investor Declaration / Net Worth Proof is mandatory';
        } else if (isProfessional || isHealthcare) {
          errors.categoryDoc = 'Professional Council / Practice License Proof is mandatory';
        } else {
          errors.categoryDoc = 'Category verification document is mandatory';
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setFieldErrors({});
    setCurrentStep(4);
  };

  // Step 4 Payment Simulation
  const handleProcessPayment = () => {
    if (!agreedTerms) {
      setFieldErrors({ terms: 'Please agree to the FIC Platform Terms to proceed.' });
      return;
    }
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsSubmittedSuccess(true);
    }, 1200);
  };

  // Native Document Picker & Management Handlers
  const handleOpenDocPicker = (target: 'PRIMARY' | 'CATEGORY') => {
    setDocPickerTarget(target);
    setDocPickerVisible(true);
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'FIC Business Hub requires camera access to capture your KYC verification document.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Camera permission request error:', err);
      return false;
    }
  };

  const handleSelectDocSource = async (source: 'CAMERA' | 'GALLERY' | 'DOCUMENT') => {
    setDocPickerVisible(false);
    const targetKey = docPickerTarget === 'PRIMARY' ? 'primaryDoc' : 'categoryDoc';

    try {
      if (source === 'CAMERA') {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
          updateFieldError(targetKey, 'Camera permission is required to capture photos.');
          return;
        }

        const result = await launchCamera({
          mediaType: 'photo',
          cameraType: 'back',
          quality: 0.8,
          saveToPhotos: false,
          includeBase64: false,
        });

        if (result.didCancel) {
          // User cancelled camera capture - keep previous state unchanged
          return;
        }

        if (result.errorCode) {
          if (result.errorCode !== 'permission') {
            updateFieldError(
              targetKey,
              result.errorMessage || `Camera error (${result.errorCode})`
            );
          }
          return;
        }

        const asset = result.assets?.[0];
        if (!asset || !asset.uri) {
          return;
        }

        const fileSizeNumber = asset.fileSize || 0;
        if (fileSizeNumber > 5 * 1024 * 1024) {
          updateFieldError(targetKey, 'Captured photo exceeds the 5 MB limit. Please take a smaller photo.');
          return;
        }

        const fallbackName = `kyc_photo_${Date.now()}.jpg`;
        const fileName = asset.fileName || fallbackName;
        const fileType = asset.type || 'image/jpeg';

        const newDoc: AttachedFile = {
          name: fileName,
          size: formatFileSize(fileSizeNumber),
          sizeBytes: fileSizeNumber,
          type: fileType,
          source: 'CAMERA',
          uri: asset.uri,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Attached',
        };

        if (docPickerTarget === 'PRIMARY') {
          setPrimaryDoc(newDoc);
          updateFieldError('primaryDoc', null);
        } else {
          setCategoryDoc(newDoc);
          updateFieldError('categoryDoc', null);
        }
      } else if (source === 'GALLERY') {
        const result = await launchImageLibrary({
          mediaType: 'photo',
          quality: 0.8,
          selectionLimit: 1,
          includeBase64: false,
        });

        if (result.didCancel) {
          // User closed photo picker without selecting an image
          return;
        }

        if (result.errorCode) {
          updateFieldError(
            targetKey,
            result.errorMessage || `Gallery error (${result.errorCode})`
          );
          return;
        }

        const asset = result.assets?.[0];
        if (!asset || !asset.uri) {
          return;
        }

        const fileSizeNumber = asset.fileSize || 0;
        if (fileSizeNumber > 5 * 1024 * 1024) {
          updateFieldError(targetKey, 'Selected image exceeds the 5 MB limit. Please select an image under 5 MB.');
          return;
        }

        const fallbackName = `gallery_image_${Date.now()}.png`;
        const fileName = asset.fileName || fallbackName;
        const fileType = asset.type || 'image/png';

        const newDoc: AttachedFile = {
          name: fileName,
          size: formatFileSize(fileSizeNumber),
          sizeBytes: fileSizeNumber,
          type: fileType,
          source: 'GALLERY',
          uri: asset.uri,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Attached',
        };

        if (docPickerTarget === 'PRIMARY') {
          setPrimaryDoc(newDoc);
          updateFieldError('primaryDoc', null);
        } else {
          setCategoryDoc(newDoc);
          updateFieldError('categoryDoc', null);
        }
      } else if (source === 'DOCUMENT') {
        try {
          const res = await DocumentPicker.pick({
            type: [docTypes.pdf, docTypes.images],
            copyTo: 'cachesDirectory',
            allowMultiSelection: false,
          });

          const file = Array.isArray(res) ? res[0] : res;
          if (!file || !file.uri) {
            return;
          }

          const fileSizeNumber = file.size || 0;
          if (fileSizeNumber > 5 * 1024 * 1024) {
            updateFieldError(targetKey, 'Document exceeds the 5 MB limit. Please select a smaller file.');
            return;
          }

          const fallbackName = `document_${Date.now()}.pdf`;
          const fileName = file.name || fallbackName;
          const fileType = file.type || 'application/pdf';

          const newDoc: AttachedFile = {
            name: fileName,
            size: formatFileSize(fileSizeNumber),
            sizeBytes: fileSizeNumber,
            type: fileType,
            source: 'DOCUMENT',
            uri: file.fileCopyUri || file.uri,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'Attached',
          };

          if (docPickerTarget === 'PRIMARY') {
            setPrimaryDoc(newDoc);
            updateFieldError('primaryDoc', null);
          } else {
            setCategoryDoc(newDoc);
            updateFieldError('categoryDoc', null);
          }
        } catch (err) {
          if (DocumentPicker.isCancel(err)) {
            // User cancelled file selection - keep previous state unchanged
            return;
          }
          console.warn('Document picker error:', err);
          updateFieldError(targetKey, 'Unable to open file picker. Please try again.');
        }
      }
    } catch (e: any) {
      console.warn('File selection error:', e);
      updateFieldError(targetKey, e?.message || 'Failed to select document.');
    }
  };

  const handleRemoveDoc = (target: 'PRIMARY' | 'CATEGORY') => {
    notify.confirm({
      title: 'Remove Document',
      message: 'Are you sure you want to remove this attached document?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      isDestructive: true,
      onConfirm: () => {
        if (target === 'PRIMARY') setPrimaryDoc(null);
        else setCategoryDoc(null);
        notify.info('Document has been removed.', 'Document Removed');
      },
    });
  };

  const handlePreviewDoc = (doc: AttachedFile, title: string) => {
    setPreviewDoc(doc);
    setPreviewDocTitle(title);
    setPreviewModalVisible(true);
  };

  const getPrimaryDocLabel = () => {
    return verificationMethod === 'AADHAAR'
      ? 'Upload Masked Aadhaar Card Proof'
      : 'Upload Official Govt ID Proof (PAN / Voter / License)';
  };

  const getCategoryDocLabel = () => {
    if (isStudent) {
      return isCollegeStudent ? 'Upload Student / College ID Card Proof' : 'Upload School ID / Bonafide Proof';
    }
    if (isEducation) return 'Upload Degree Certificate / Faculty Experience Proof';
    if (isProfessional || isHealthcare) return 'Upload Professional Council / License ID Proof';
    if (isManufacturing || isBusiness) return 'Upload GSTIN / Udyam Certificate Proof';
    if (isAgriculture) return 'Upload Land Patta / Farmer Producer ID Proof';
    if (isInvestment) return 'Upload Net Worth / Investor Accreditation Proof';
    return 'Upload Category Qualification Document Proof';
  };

  const getCategoryDocNumberConfig = () => {
    if (isStudent) {
      return {
        label: isCollegeStudent ? 'Student / College ID Number' : 'School ID / Roll Number',
        placeholder: 'e.g. 675RTFGHBNMN or 2024CS0192',
        maxLength: 25,
        emoji: '🪪',
        errorMsg: isCollegeStudent
          ? 'Student / College ID Number is required (alphanumeric)'
          : 'School ID / Roll Number is required (alphanumeric)',
      };
    }
    if (isEducation && !isStudent) {
      return {
        label: 'Degree Certificate / Registration Number',
        placeholder: 'e.g. CERT-ED-98234 or REG-2018-882',
        maxLength: 30,
        emoji: '📜',
        errorMsg: 'Degree Certificate / Registration Number is required (alphanumeric)',
      };
    }
    if (isManufacturing || isBusiness) {
      return {
        label: 'Business Registration Number (GSTIN / Udyam / Reg No)',
        placeholder: 'e.g. 33AAAAA0000A1Z5 or UDYAM-TN-02-0012345',
        maxLength: 30,
        emoji: '🏢',
        errorMsg: 'Business Registration / GSTIN / Udyam Number is required',
      };
    }
    if (isProfessional || isHealthcare) {
      return {
        label: 'Council Registration / License Number',
        placeholder: 'e.g. MCI-2015-89412 or BAR-TN-4521',
        maxLength: 30,
        emoji: '⚖️',
        errorMsg: 'Council Registration / Professional License Number is required',
      };
    }
    if (isAgriculture) {
      return {
        label: 'Farmer ID / Patta Registration Number',
        placeholder: 'e.g. TN-AGR-882910',
        maxLength: 25,
        emoji: '🌾',
        errorMsg: 'Farmer ID or Patta Registration Number is required',
      };
    }
    if (isInvestment) {
      return {
        label: 'Investor Accreditation / Registration Number',
        placeholder: 'e.g. IN-INV-99214 or DIN/PAN',
        maxLength: 25,
        emoji: '💼',
        errorMsg: 'Investor Identification / Accreditation Number is required',
      };
    }
    return {
      label: 'Document Identification Number',
      placeholder: 'Enter document registration or ID number',
      maxLength: 30,
      emoji: '📄',
      errorMsg: 'Document identification number is required',
    };
  };

  const isCategoryDocRequired = () => {
    return (
      (isStudent && isCollegeStudent) ||
      (isEducation && !isStudent) ||
      isManufacturing ||
      isBusiness ||
      isInvestment ||
      isProfessional ||
      isHealthcare
    );
  };

  // Derived Date Info
  const dobCheckResult = parseDateAndValidateAge(dob);

  // Available Picker Years (1940 to 2008 - automatically 18+ for 2026)
  const eligibleYears = Array.from({ length: 69 }, (_, i) => 2008 - i);
  const daysInCurrentPickerMonth = new Date(pickerYear, pickerMonth, 0).getDate();
  const eligibleDays = Array.from({ length: daysInCurrentPickerMonth }, (_, i) => i + 1);

  // Calculated Age in Modal
  const modalCalculatedAge = (() => {
    const today = new Date();
    let a = today.getFullYear() - pickerYear;
    const m = today.getMonth() - (pickerMonth - 1);
    if (m < 0 || (m === 0 && today.getDate() < pickerDay)) a--;
    return a;
  })();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEE8D2" translucent={false} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Banner (Preserving FIC logo, Skyline, Business people, and Wave) */}
          <View style={styles.bannerContainer}>
            <Image
              source={require('../../assets/images/login_banner.jpg')}
              style={styles.bannerImage}
              resizeMode="contain"
            />
          </View>

          {/* Form Content Container */}
          <View style={styles.formContainer}>
            {/* Header Titles */}
            <View style={styles.headerBlock}>
              <Text style={styles.welcomeTitle}>Create Your Account</Text>
              <Text style={styles.welcomeSubtitle}>
                Join FIC Business Hub and unlock business opportunities.
              </Text>
            </View>

            {/* 4-Step Stepper Navigation */}
            <View style={styles.stepperContainer}>
              <View style={styles.stepperRow}>
                {/* Step 1 Indicator */}
                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      currentStep === 1 && styles.stepCircleActive,
                      currentStep > 1 && styles.stepCircleCompleted,
                    ]}
                  >
                    {currentStep > 1 ? (
                      <Text style={styles.stepCheckmark}>✓</Text>
                    ) : (
                      <Text
                        style={[
                          styles.stepNumber,
                          currentStep === 1 && styles.stepNumberActive,
                        ]}
                      >
                        1
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      currentStep === 1 && styles.stepLabelActive,
                      currentStep > 1 && styles.stepLabelCompleted,
                    ]}
                  >
                    Basic Details
                  </Text>
                  {currentStep === 1 && <View style={styles.stepActiveUnderline} />}
                </View>

                {/* Connecting Line 1-2 */}
                <View
                  style={[
                    styles.stepConnector,
                    currentStep > 1 && styles.stepConnectorActive,
                  ]}
                />

                {/* Step 2 Indicator */}
                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      currentStep === 2 && styles.stepCircleActive,
                      currentStep > 2 && styles.stepCircleCompleted,
                    ]}
                  >
                    {currentStep > 2 ? (
                      <Text style={styles.stepCheckmark}>✓</Text>
                    ) : (
                      <Text
                        style={[
                          styles.stepNumber,
                          currentStep === 2 && styles.stepNumberActive,
                        ]}
                      >
                        2
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      currentStep === 2 && styles.stepLabelActive,
                      currentStep > 2 && styles.stepLabelCompleted,
                    ]}
                  >
                    Profile Details
                  </Text>
                  {currentStep === 2 && <View style={styles.stepActiveUnderline} />}
                </View>

                {/* Connecting Line 2-3 */}
                <View
                  style={[
                    styles.stepConnector,
                    currentStep > 2 && styles.stepConnectorActive,
                  ]}
                />

                {/* Step 3 Indicator */}
                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      currentStep === 3 && styles.stepCircleActive,
                      currentStep > 3 && styles.stepCircleCompleted,
                    ]}
                  >
                    {currentStep > 3 ? (
                      <Text style={styles.stepCheckmark}>✓</Text>
                    ) : (
                      <Text
                        style={[
                          styles.stepNumber,
                          currentStep === 3 && styles.stepNumberActive,
                        ]}
                      >
                        3
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      currentStep === 3 && styles.stepLabelActive,
                      currentStep > 3 && styles.stepLabelCompleted,
                    ]}
                  >
                    Verification
                  </Text>
                  {currentStep === 3 && <View style={styles.stepActiveUnderline} />}
                </View>

                {/* Connecting Line 3-4 */}
                <View
                  style={[
                    styles.stepConnector,
                    currentStep > 3 && styles.stepConnectorActive,
                  ]}
                />

                {/* Step 4 Indicator */}
                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      currentStep === 4 && styles.stepCircleActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNumber,
                        currentStep === 4 && styles.stepNumberActive,
                      ]}
                    >
                      4
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      currentStep === 4 && styles.stepLabelActive,
                    ]}
                  >
                    Payment
                  </Text>
                  {currentStep === 4 && <View style={styles.stepActiveUnderline} />}
                </View>
              </View>
            </View>

            {/* ============================================================== */}
            {/* STEP 1: BASIC DETAILS & ACCOUNT CREDENTIALS                     */}
            {/* ============================================================== */}
            {currentStep === 1 && (
              <View style={styles.stepContent}>
                <Text style={styles.sectionHeader}>Step 1 of 4: Basic Details</Text>

                {/* 1. Main Category */}
                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>
                    Select Main Category <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dropdownPill,
                      fieldErrors.category ? styles.inputPillError : null,
                    ]}
                    activeOpacity={0.8}
                    onPress={() =>
                      openPicker(
                        'Select Main Category',
                        Object.keys(CATEGORY_OPTIONS),
                        (val) => {
                          setSelectedCategory(val);
                          resetCategoryFields();
                          updateFieldError('category', null);
                        }
                      )
                    }
                  >
                    <View style={styles.iconBox}>
                      <Text style={styles.iconEmoji}>🏢</Text>
                    </View>
                    <Text
                      style={[
                        styles.dropdownPillText,
                        !selectedCategory && styles.dropdownPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {selectedCategory || 'Choose Your Main Category'}
                    </Text>
                    <Text style={styles.chevronIcon}>▼</Text>
                  </TouchableOpacity>
                  {fieldErrors.category ? (
                    <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.category}</Text>
                  ) : null}
                </View>

                {/* 2. Subcategory (Directly below Main Category) */}
                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>
                    Select Subcategory <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dropdownPill,
                      !selectedCategory && { opacity: 0.65 },
                      fieldErrors.subCategory ? styles.inputPillError : null,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (!selectedCategory) {
                        updateFieldError('category', 'Please select your Main Category.');
                        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                        return;
                      }
                      const subOptions = CATEGORY_OPTIONS[selectedCategory] || [];
                      openPicker(
                        `Select Subcategory (${selectedCategory})`,
                        subOptions,
                        (val) => {
                          setSelectedSubCategory(val);
                          updateFieldError('subCategory', null);
                        }
                      );
                    }}
                  >
                    <View style={styles.iconBox}>
                      <Text style={styles.iconEmoji}>🏷️</Text>
                    </View>
                    <Text
                      style={[
                        styles.dropdownPillText,
                        !selectedSubCategory && styles.dropdownPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {selectedSubCategory || (selectedCategory ? 'Choose Subcategory' : 'Select Main Category first')}
                    </Text>
                    <Text style={styles.chevronIcon}>▼</Text>
                  </TouchableOpacity>
                  {fieldErrors.subCategory ? (
                    <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.subCategory}</Text>
                  ) : null}
                </View>

                {/* 3. Full Name (Text-only: no numbers or special symbols) */}
                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>
                    Full Name <Text style={styles.requiredStar}>* (Text only)</Text>
                  </Text>
                  <View style={[styles.inputPill, fieldErrors.fullName ? styles.inputPillError : null]}>
                    <View style={styles.iconBox}>
                      <Text style={styles.iconEmoji}>👤</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your full name (letters only)"
                      placeholderTextColor="#A3968C"
                      value={fullName}
                      onChangeText={handleFullNameChange}
                      autoCapitalize="words"
                    />
                  </View>
                  {fieldErrors.fullName ? (
                    <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.fullName}</Text>
                  ) : null}
                </View>

                {/* 4. Email Address */}
                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>
                    Official Email Address <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={[styles.inputPill, fieldErrors.email ? styles.inputPillError : null]}>
                    <View style={styles.iconBox}>
                      <Text style={styles.iconEmoji}>✉️</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your email address"
                      placeholderTextColor="#A3968C"
                      value={email}
                      onChangeText={handleEmailChange}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {fieldErrors.email ? (
                    <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.email}</Text>
                  ) : null}
                </View>

                {/* 5. Mobile Number (Number-only: 10 digits starting with 6-9) */}
                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>
                    Mobile Number <Text style={styles.requiredStar}>* (10 digits)</Text>
                  </Text>
                  <View style={[styles.inputPill, fieldErrors.mobile ? styles.inputPillError : null]}>
                    <View style={styles.iconBox}>
                      <Text style={styles.iconEmoji}>📞</Text>
                    </View>
                    <View style={styles.countryCodeBadge}>
                      <Text style={styles.countryCodeText}>+91</Text>
                    </View>
                    <TextInput
                      style={[styles.textInput, { marginLeft: 8 }]}
                      placeholder="Enter 10-digit number"
                      placeholderTextColor="#A3968C"
                      value={mobile}
                      onChangeText={handleMobileChange}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                  {fieldErrors.mobile ? (
                    <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.mobile}</Text>
                  ) : null}
                </View>

                {/* 6. Date of Birth (Interactive Date Picker Modal + Formatted Input, 18+ requirement) */}
                <View style={styles.fieldBlock}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.fieldLabel}>
                      Date of Birth <Text style={styles.requiredStar}>* (18+ only)</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.openPickerQuickBtn}
                      onPress={handleOpenDatePicker}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.openPickerQuickText}>📅 Open Date Picker</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleOpenDatePicker}
                    style={[styles.inputPill, fieldErrors.dob ? styles.inputPillError : null]}
                  >
                    <View style={styles.iconBox}>
                      <Text style={styles.iconEmoji}>🎂</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="DD / MM / YYYY (Tap to pick)"
                      placeholderTextColor="#A3968C"
                      value={dob}
                      onChangeText={handleDobChange}
                      keyboardType="number-pad"
                      maxLength={14}
                    />
                    <TouchableOpacity
                      onPress={handleOpenDatePicker}
                      style={styles.calendarInlineIconBtn}
                    >
                      <Text style={{ fontSize: 16 }}>🗓️</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>

                  {fieldErrors.dob ? (
                    <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.dob}</Text>
                  ) : dobCheckResult.valid ? (
                    <Text style={styles.fieldSuccessText}>
                      ✓ Age verified: {dobCheckResult.age} years old (Eligible for registration)
                    </Text>
                  ) : null}
                </View>

                {/* 7. Password Field */}
                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>
                    Password <Text style={styles.requiredStar}>* (min 6 characters)</Text>
                  </Text>
                  <View style={[styles.inputPill, fieldErrors.password ? styles.inputPillError : null]}>
                    <View style={styles.iconBox}>
                      <Text style={styles.iconEmoji}>🔒</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Create a strong password"
                      placeholderTextColor="#A3968C"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={handlePasswordChange}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                  </View>
                  {fieldErrors.password ? (
                    <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.password}</Text>
                  ) : null}
                </View>

                {/* 8. Confirm Password Field */}
                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>
                    Confirm Password <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={[styles.inputPill, fieldErrors.confirmPassword ? styles.inputPillError : null]}>
                    <View style={styles.iconBox}>
                      <Text style={styles.iconEmoji}>🔐</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Re-enter your password"
                      placeholderTextColor="#A3968C"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={handleConfirmPasswordChange}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                  </View>
                  {fieldErrors.confirmPassword ? (
                    <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.confirmPassword}</Text>
                  ) : null}
                </View>

                {/* 9. Optional Referral Code Field */}
                <View style={styles.fieldBlock}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.fieldLabel}>Referral Code (Optional)</Text>
                    {referralCodeInput.toUpperCase() === 'REF1234' ? (
                      <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 }}>
                        <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#166534' }}>✓ Valid Referrer Linked</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.inputPill}>
                    <View style={styles.iconBox}>
                      <Text style={styles.iconEmoji}>🎁</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. REF1234"
                      placeholderTextColor="#A3968C"
                      autoCapitalize="characters"
                      value={referralCodeInput}
                      onChangeText={(val) => setReferralCodeInput(val.toUpperCase().trim())}
                    />
                  </View>
                  <Text style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>
                    Have an invitation code from an existing FIC member? Enter it to link referral rewards.
                  </Text>
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                  style={styles.primaryButton}
                  activeOpacity={0.88}
                  onPress={handleNextFromStep1}
                >
                  <Text style={styles.primaryButtonText}>Continue  →</Text>
                </TouchableOpacity>

                {/* Redirect back to Login */}
                <View style={styles.loginRedirectRow}>
                  <Text style={styles.loginRedirectText}>Already have an account? </Text>
                  <TouchableOpacity onPress={onBackToLogin}>
                    <Text style={styles.loginRedirectLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ============================================================== */}
            {/* STEP 2: PROFILE & CATEGORY-BASED BUSINESS DETAILS              */}
            {/* ============================================================== */}
            {currentStep === 2 && (
              <View style={styles.stepContent}>
                <Text style={styles.sectionHeader}>Step 2 of 4: Profile Details</Text>

                {/* Category & Subcategory Summary Pill */}
                <View style={styles.categoryBadgePill}>
                  <Text style={styles.categoryBadgeText}>
                    Track:{' '}
                    <Text style={{ fontWeight: '800' }}>{selectedCategory}</Text>
                    {'  ›  '}
                    <Text style={{ fontWeight: '800', color: '#0C4E3D' }}>
                      {selectedSubCategory}
                    </Text>
                  </Text>
                </View>

                {/* DYNAMIC REGISTRATION FORM (Conditioned by Category & Subcategory per Section 3.6) */}

                {/* CASE 1: EDUCATION & KNOWLEDGE */}
                {isEducation && (
                  <>
                    {isStudent ? (
                      <>
                        <View style={styles.fieldBlock}>
                          <Text style={styles.fieldLabel}>
                            Education Level <Text style={styles.requiredStar}>*</Text>
                          </Text>
                          <TouchableOpacity
                            style={[
                              styles.dropdownPill,
                              fieldErrors.educationLevel ? styles.inputPillError : null,
                            ]}
                            activeOpacity={0.8}
                            onPress={() =>
                              openPicker('Education Level', EDUCATION_LEVEL_OPTIONS, (val) => {
                                setEducationLevel(val);
                                updateFieldError('educationLevel', null);
                              })
                            }
                          >
                            <View style={styles.iconBox}><Text style={styles.iconEmoji}>🎓</Text></View>
                            <Text style={[styles.dropdownPillText, !educationLevel && styles.dropdownPlaceholder]} numberOfLines={1}>
                              {educationLevel || 'Select Education Level'}
                            </Text>
                            <Text style={styles.chevronIcon}>▼</Text>
                          </TouchableOpacity>
                          {fieldErrors.educationLevel ? (
                            <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.educationLevel}</Text>
                          ) : null}
                        </View>

                        <View style={styles.fieldBlock}>
                          <Text style={styles.fieldLabel}>
                            {isCollegeStudent ? 'College / University Name' : 'School / Institution Name'} <Text style={styles.requiredStar}>*</Text>
                          </Text>
                          <View style={[styles.inputPill, fieldErrors.institutionName ? styles.inputPillError : null]}>
                            <View style={styles.iconBox}><Text style={styles.iconEmoji}>🏫</Text></View>
                            <TextInput
                              style={styles.textInput}
                              placeholder={isCollegeStudent ? "e.g. PSG Tech, Anna University, IIT Madras" : "e.g. Higher Secondary School"}
                              placeholderTextColor="#A3968C"
                              value={institutionName}
                              onChangeText={(t) =>
                                handleAlphanumericChange(
                                  setInstitutionName,
                                  'institutionName',
                                  t,
                                  2,
                                  isCollegeStudent ? 'College Name' : 'School Name'
                                )
                              }
                            />
                          </View>
                          {fieldErrors.institutionName ? (
                            <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.institutionName}</Text>
                          ) : null}
                        </View>

                        <View style={styles.fieldBlock}>
                          <Text style={styles.fieldLabel}>
                            Degree / Course / Major <Text style={styles.requiredStar}>*</Text>
                          </Text>
                          <View style={[styles.inputPill, fieldErrors.degreeCourse ? styles.inputPillError : null]}>
                            <View style={styles.iconBox}><Text style={styles.iconEmoji}>📖</Text></View>
                            <TextInput
                              style={styles.textInput}
                              placeholder={isCollegeStudent ? "e.g. B.Tech Computer Science, MBA" : "e.g. Class 12, Science Stream"}
                              placeholderTextColor="#A3968C"
                              value={degreeCourse}
                              onChangeText={(t) =>
                                handleAlphanumericChange(
                                  setDegreeCourse,
                                  'degreeCourse',
                                  t,
                                  2,
                                  'Degree/Course'
                                )
                              }
                            />
                          </View>
                          {fieldErrors.degreeCourse ? (
                            <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.degreeCourse}</Text>
                          ) : null}
                        </View>

                        {isCollegeStudent && (
                          <View style={styles.fieldBlock}>
                            <Text style={styles.fieldLabel}>
                              Student / College ID Roll Number <Text style={styles.requiredStar}>* (Alphanumeric)</Text>
                            </Text>
                            <View style={[styles.inputPill, fieldErrors.studentIdNumber ? styles.inputPillError : null]}>
                              <View style={styles.iconBox}><Text style={styles.iconEmoji}>🪪</Text></View>
                              <TextInput
                                style={styles.textInput}
                                placeholder="e.g. 2023CS0148 / STU-9921"
                                placeholderTextColor="#A3968C"
                                value={studentIdNumber}
                                onChangeText={(t) => {
                                  const sanitized = t.toUpperCase().replace(/[^a-zA-Z0-9\-\/]/g, '');
                                  setStudentIdNumber(sanitized);
                                  if (!sanitized.trim()) {
                                    updateFieldError('studentIdNumber', 'Student / College ID is required');
                                  } else {
                                    updateFieldError('studentIdNumber', null);
                                  }
                                }}
                                autoCapitalize="characters"
                              />
                            </View>
                            {fieldErrors.studentIdNumber ? (
                              <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.studentIdNumber}</Text>
                            ) : null}
                          </View>
                        )}

                        <View style={styles.fieldBlock}>
                          <Text style={styles.fieldLabel}>
                            Primary Skills & Career Interests <Text style={styles.requiredStar}>*</Text>
                          </Text>
                          <View style={[styles.inputPill, fieldErrors.skillsOrProducts ? styles.inputPillError : null]}>
                            <View style={styles.iconBox}><Text style={styles.iconEmoji}>💡</Text></View>
                            <TextInput
                              style={styles.textInput}
                              placeholder="e.g. AI/ML, Python, Embedded Systems, Robotics"
                              placeholderTextColor="#A3968C"
                              value={skillsOrProducts}
                              onChangeText={(t) =>
                                handleAlphanumericChange(
                                  setSkillsOrProducts,
                                  'skillsOrProducts',
                                  t,
                                  2,
                                  'Primary Skills'
                                )
                              }
                            />
                          </View>
                          {fieldErrors.skillsOrProducts ? (
                            <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.skillsOrProducts}</Text>
                          ) : null}
                        </View>

                        <View style={styles.fieldBlock}>
                          <Text style={styles.fieldLabel}>
                            Mentoring & Incubation Guidance Needed <Text style={styles.requiredStar}>*</Text>
                          </Text>
                          <TouchableOpacity
                            style={[
                              styles.dropdownPill,
                              fieldErrors.mentoringNeed ? styles.inputPillError : null,
                            ]}
                            activeOpacity={0.8}
                            onPress={() =>
                              openPicker('Mentoring Guidance Need', MENTORING_NEEDS, (val) => {
                                setMentoringNeed(val);
                                updateFieldError('mentoringNeed', null);
                              })
                            }
                          >
                            <View style={styles.iconBox}><Text style={styles.iconEmoji}>🧭</Text></View>
                            <Text style={[styles.dropdownPillText, !mentoringNeed && styles.dropdownPlaceholder]} numberOfLines={1}>
                              {mentoringNeed || 'Select mentorship priority'}
                            </Text>
                            <Text style={styles.chevronIcon}>▼</Text>
                          </TouchableOpacity>
                          {fieldErrors.mentoringNeed ? (
                            <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.mentoringNeed}</Text>
                          ) : null}
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.fieldBlock}>
                          <Text style={styles.fieldLabel}>
                            Academy / University / Organization Name <Text style={styles.requiredStar}>*</Text>
                          </Text>
                          <View style={[styles.inputPill, fieldErrors.institutionName ? styles.inputPillError : null]}>
                            <View style={styles.iconBox}><Text style={styles.iconEmoji}>🏫</Text></View>
                            <TextInput
                              style={styles.textInput}
                              placeholder="e.g. PSG Tech, National Institute of Technology"
                              placeholderTextColor="#A3968C"
                              value={institutionName}
                              onChangeText={(t) =>
                                handleAlphanumericChange(
                                  setInstitutionName,
                                  'institutionName',
                                  t,
                                  2,
                                  'Institution Name'
                                )
                              }
                            />
                          </View>
                          {fieldErrors.institutionName ? (
                            <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.institutionName}</Text>
                          ) : null}
                        </View>

                        <View style={styles.fieldBlock}>
                          <Text style={styles.fieldLabel}>
                            Academic Designation & Department <Text style={styles.requiredStar}>*</Text>
                          </Text>
                          <View style={[styles.inputPill, fieldErrors.degreeCourse ? styles.inputPillError : null]}>
                            <View style={styles.iconBox}><Text style={styles.iconEmoji}>🎖️</Text></View>
                            <TextInput
                              style={styles.textInput}
                              placeholder="e.g. Professor of Mechanical Engineering"
                              placeholderTextColor="#A3968C"
                              value={degreeCourse}
                              onChangeText={(t) =>
                                handleAlphanumericChange(
                                  setDegreeCourse,
                                  'degreeCourse',
                                  t,
                                  2,
                                  'Designation'
                                )
                              }
                            />
                          </View>
                          {fieldErrors.degreeCourse ? (
                            <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.degreeCourse}</Text>
                          ) : null}
                        </View>

                        <View style={styles.fieldBlock}>
                          <Text style={styles.fieldLabel}>
                            Domain Specialization / Research Area <Text style={styles.requiredStar}>*</Text>
                          </Text>
                          <View style={[styles.inputPill, fieldErrors.skillsOrProducts ? styles.inputPillError : null]}>
                            <View style={styles.iconBox}><Text style={styles.iconEmoji}>🔬</Text></View>
                            <TextInput
                              style={styles.textInput}
                              placeholder="e.g. Industrial Automation, Lean Six Sigma"
                              placeholderTextColor="#A3968C"
                              value={skillsOrProducts}
                              onChangeText={(t) =>
                                handleAlphanumericChange(
                                  setSkillsOrProducts,
                                  'skillsOrProducts',
                                  t,
                                  2,
                                  'Specialization Area'
                                )
                              }
                            />
                          </View>
                          {fieldErrors.skillsOrProducts ? (
                            <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.skillsOrProducts}</Text>
                          ) : null}
                        </View>

                        <View style={styles.fieldBlock}>
                          <Text style={styles.fieldLabel}>
                            Teaching / Mentoring Experience <Text style={styles.requiredStar}>*</Text>
                          </Text>
                          <TouchableOpacity
                            style={[
                              styles.dropdownPill,
                              fieldErrors.experienceLevel ? styles.inputPillError : null,
                            ]}
                            activeOpacity={0.8}
                            onPress={() =>
                              openPicker('Experience Level', EXPERIENCE_LEVELS, (val) => {
                                setExperienceLevel(val);
                                updateFieldError('experienceLevel', null);
                              })
                            }
                          >
                            <View style={styles.iconBox}><Text style={styles.iconEmoji}>⏳</Text></View>
                            <Text style={[styles.dropdownPillText, !experienceLevel && styles.dropdownPlaceholder]} numberOfLines={1}>
                              {experienceLevel || 'Select years of experience'}
                            </Text>
                            <Text style={styles.chevronIcon}>▼</Text>
                          </TouchableOpacity>
                          {fieldErrors.experienceLevel ? (
                            <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.experienceLevel}</Text>
                          ) : null}
                        </View>
                      </>
                    )}
                  </>
                )}

                {/* CASE 2: TECHNOLOGY & DIGITAL */}
                {isTechnology && (
                  <>
                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Startup / Agency / Professional Practice Name <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View style={[styles.inputPill, fieldErrors.businessName ? styles.inputPillError : null]}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>💻</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="e.g. Nexus Cognitive Solutions / Tech Practice"
                          placeholderTextColor="#A3968C"
                          value={businessName}
                          onChangeText={(t) =>
                            handleAlphanumericChange(
                              setBusinessName,
                              'businessName',
                              t,
                              2,
                              'Practice Name'
                            )
                          }
                        />
                      </View>
                      {fieldErrors.businessName ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.businessName}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Core Technology Stack & Skills <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View style={[styles.inputPill, fieldErrors.skillsOrProducts ? styles.inputPillError : null]}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>⚡</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="e.g. React Native, Node.js, Python, AWS, IoT"
                          placeholderTextColor="#A3968C"
                          value={skillsOrProducts}
                          onChangeText={(t) =>
                            handleAlphanumericChange(
                              setSkillsOrProducts,
                              'skillsOrProducts',
                              t,
                              2,
                              'Technology Stack'
                            )
                          }
                        />
                      </View>
                      {fieldErrors.skillsOrProducts ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.skillsOrProducts}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Professional Experience Level <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.dropdownPill,
                          fieldErrors.experienceLevel ? styles.inputPillError : null,
                        ]}
                        activeOpacity={0.8}
                        onPress={() =>
                          openPicker('Experience Level', EXPERIENCE_LEVELS, (val) => {
                            setExperienceLevel(val);
                            updateFieldError('experienceLevel', null);
                          })
                        }
                      >
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>⏳</Text></View>
                        <Text style={[styles.dropdownPillText, !experienceLevel && styles.dropdownPlaceholder]} numberOfLines={1}>
                          {experienceLevel || 'Select experience level'}
                        </Text>
                        <Text style={styles.chevronIcon}>▼</Text>
                      </TouchableOpacity>
                      {fieldErrors.experienceLevel ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.experienceLevel}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Engagement / Availability Model <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.dropdownPill,
                          fieldErrors.mentoringNeed ? styles.inputPillError : null,
                        ]}
                        activeOpacity={0.8}
                        onPress={() =>
                          openPicker('Availability Model', AVAILABILITY_MODELS, (val) => {
                            setMentoringNeed(val);
                            updateFieldError('mentoringNeed', null);
                          })
                        }
                      >
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>🤝</Text></View>
                        <Text style={[styles.dropdownPillText, !mentoringNeed && styles.dropdownPlaceholder]} numberOfLines={1}>
                          {mentoringNeed || 'Select availability model'}
                        </Text>
                        <Text style={styles.chevronIcon}>▼</Text>
                      </TouchableOpacity>
                      {fieldErrors.mentoringNeed ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.mentoringNeed}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Portfolio / GitHub / Website Link <Text style={styles.optionalText}>(Optional)</Text>
                      </Text>
                      <View style={styles.inputPill}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>🔗</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="https://github.com/yourhandle or portfolio url"
                          placeholderTextColor="#A3968C"
                          value={portfolioUrl}
                          onChangeText={setPortfolioUrl}
                          autoCapitalize="none"
                        />
                      </View>
                    </View>
                  </>
                )}

                {/* CASE 3: INVESTMENT & FINANCE */}
                {isInvestment && (
                  <>
                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Investment Entity / Fund / Portfolio Name <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View style={[styles.inputPill, fieldErrors.businessName ? styles.inputPillError : null]}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>🪙</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="Enter fund, angel syndicate, or investor name"
                          placeholderTextColor="#A3968C"
                          value={businessName}
                          onChangeText={(t) =>
                            handleAlphanumericChange(
                              setBusinessName,
                              'businessName',
                              t,
                              2,
                              'Investor Name'
                            )
                          }
                        />
                      </View>
                      {fieldErrors.businessName ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.businessName}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Preferred Investment Ticket Size <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.dropdownPill,
                          fieldErrors.investmentTicket ? styles.inputPillError : null,
                        ]}
                        activeOpacity={0.8}
                        onPress={() =>
                          openPicker('Investment Ticket Size', INVESTMENT_TICKETS, (val) => {
                            setInvestmentTicket(val);
                            updateFieldError('investmentTicket', null);
                          })
                        }
                      >
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>💰</Text></View>
                        <Text style={[styles.dropdownPillText, !investmentTicket && styles.dropdownPlaceholder]} numberOfLines={1}>
                          {investmentTicket || 'Select investment range'}
                        </Text>
                        <Text style={styles.chevronIcon}>▼</Text>
                      </TouchableOpacity>
                      {fieldErrors.investmentTicket ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.investmentTicket}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Target Business Stage <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.dropdownPill,
                          fieldErrors.targetInvestmentStage ? styles.inputPillError : null,
                        ]}
                        activeOpacity={0.8}
                        onPress={() =>
                          openPicker('Target Business Stage', INVESTMENT_STAGES, (val) => {
                            setTargetInvestmentStage(val);
                            updateFieldError('targetInvestmentStage', null);
                          })
                        }
                      >
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>📈</Text></View>
                        <Text style={[styles.dropdownPillText, !targetInvestmentStage && styles.dropdownPlaceholder]} numberOfLines={1}>
                          {targetInvestmentStage || 'Select preferred business stage'}
                        </Text>
                        <Text style={styles.chevronIcon}>▼</Text>
                      </TouchableOpacity>
                      {fieldErrors.targetInvestmentStage ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.targetInvestmentStage}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Preferred Industry Sectors <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View style={[styles.inputPill, fieldErrors.skillsOrProducts ? styles.inputPillError : null]}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>🎯</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="e.g. Manufacturing, DeepTech, Agritech, Healthcare"
                          placeholderTextColor="#A3968C"
                          value={skillsOrProducts}
                          onChangeText={(t) =>
                            handleAlphanumericChange(
                              setSkillsOrProducts,
                              'skillsOrProducts',
                              t,
                              2,
                              'Preferred Sectors'
                            )
                          }
                        />
                      </View>
                      {fieldErrors.skillsOrProducts ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.skillsOrProducts}</Text>
                      ) : null}
                    </View>
                  </>
                )}

                {/* CASE 4: PROFESSIONAL & PERSONAL SERVICES / HEALTHCARE & WELLNESS */}
                {(isProfessional || isHealthcare) && (
                  <>
                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Practice / Firm / Clinic / Professional Name <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View style={[styles.inputPill, fieldErrors.businessName ? styles.inputPillError : null]}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>⚖️</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="Enter practice, firm, or hospital/clinic name"
                          placeholderTextColor="#A3968C"
                          value={businessName}
                          onChangeText={(t) =>
                            handleAlphanumericChange(
                              setBusinessName,
                              'businessName',
                              t,
                              2,
                              'Practice Name'
                            )
                          }
                        />
                      </View>
                      {fieldErrors.businessName ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.businessName}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Professional Specialization / Practice Area <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View style={[styles.inputPill, fieldErrors.degreeCourse ? styles.inputPillError : null]}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>🩺</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="e.g. Corporate Law, Direct Tax, Architecture, Surgery"
                          placeholderTextColor="#A3968C"
                          value={degreeCourse}
                          onChangeText={(t) =>
                            handleAlphanumericChange(
                              setDegreeCourse,
                              'degreeCourse',
                              t,
                              2,
                              'Specialization'
                            )
                          }
                        />
                      </View>
                      {fieldErrors.degreeCourse ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.degreeCourse}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Council / License / Bar / Medical Registration ID <Text style={styles.optionalText}>(Optional)</Text>
                      </Text>
                      <View style={styles.inputPill}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>📜</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="e.g. Bar Council / ICAI / NMC / COA Number"
                          placeholderTextColor="#A3968C"
                          value={licenseNumber}
                          onChangeText={(t) => {
                            const sanitized = t.toUpperCase().replace(/[^a-zA-Z0-9\-\/]/g, '');
                            setLicenseNumber(sanitized);
                          }}
                          autoCapitalize="characters"
                        />
                      </View>
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Years of Professional Practice <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.dropdownPill,
                          fieldErrors.experienceLevel ? styles.inputPillError : null,
                        ]}
                        activeOpacity={0.8}
                        onPress={() =>
                          openPicker('Experience Level', EXPERIENCE_LEVELS, (val) => {
                            setExperienceLevel(val);
                            updateFieldError('experienceLevel', null);
                          })
                        }
                      >
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>⏳</Text></View>
                        <Text style={[styles.dropdownPillText, !experienceLevel && styles.dropdownPlaceholder]} numberOfLines={1}>
                          {experienceLevel || 'Select years of practice'}
                        </Text>
                        <Text style={styles.chevronIcon}>▼</Text>
                      </TouchableOpacity>
                      {fieldErrors.experienceLevel ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.experienceLevel}</Text>
                      ) : null}
                    </View>
                  </>
                )}

                {/* CASE 5: AGRICULTURE & NATURAL RESOURCES */}
                {isAgriculture && (
                  <>
                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Farm / Landholding / Agri-Business Name <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View style={[styles.inputPill, fieldErrors.businessName ? styles.inputPillError : null]}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>🌾</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="Enter farm or agri-enterprise name"
                          placeholderTextColor="#A3968C"
                          value={businessName}
                          onChangeText={(t) =>
                            handleAlphanumericChange(
                              setBusinessName,
                              'businessName',
                              t,
                              2,
                              'Farm Name'
                            )
                          }
                        />
                      </View>
                      {fieldErrors.businessName ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.businessName}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Cultivation Scale / Landholding <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View style={[styles.inputPill, fieldErrors.scaleOrLandholding ? styles.inputPillError : null]}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>🚜</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="e.g. 25 Acres, 100-Cow Dairy Unit, 5-Reefer Fleet"
                          placeholderTextColor="#A3968C"
                          value={scaleOrLandholding}
                          onChangeText={(t) =>
                            handleAlphanumericChange(
                              setScaleOrLandholding,
                              'scaleOrLandholding',
                              t,
                              2,
                              'Cultivation Scale'
                            )
                          }
                        />
                      </View>
                      {fieldErrors.scaleOrLandholding ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.scaleOrLandholding}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Primary Crops / Commodity / Produce <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View style={[styles.inputPill, fieldErrors.skillsOrProducts ? styles.inputPillError : null]}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>🌱</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="e.g. Organic Cotton, Spices, A2 Milk, Marine Fish"
                          placeholderTextColor="#A3968C"
                          value={skillsOrProducts}
                          onChangeText={(t) =>
                            handleAlphanumericChange(
                              setSkillsOrProducts,
                              'skillsOrProducts',
                              t,
                              2,
                              'Primary Produce'
                            )
                          }
                        />
                      </View>
                      {fieldErrors.skillsOrProducts ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.skillsOrProducts}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Primary Supply / Distribution Channel <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.dropdownPill,
                          fieldErrors.supplyChannel ? styles.inputPillError : null,
                        ]}
                        activeOpacity={0.8}
                        onPress={() =>
                          openPicker('Supply Channel', SUPPLY_CHANNELS, (val) => {
                            setSupplyChannel(val);
                            updateFieldError('supplyChannel', null);
                          })
                        }
                      >
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>📦</Text></View>
                        <Text style={[styles.dropdownPillText, !supplyChannel && styles.dropdownPlaceholder]} numberOfLines={1}>
                          {supplyChannel || 'Select primary supply channel'}
                        </Text>
                        <Text style={styles.chevronIcon}>▼</Text>
                      </TouchableOpacity>
                      {fieldErrors.supplyChannel ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.supplyChannel}</Text>
                      ) : null}
                    </View>
                  </>
                )}

                {/* CASE 6: CREATIVE, MEDIA & LIFESTYLE */}
                {isCreative && (
                  <>
                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Studio / Brand / Creative Handle Name <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View style={[styles.inputPill, fieldErrors.businessName ? styles.inputPillError : null]}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>🎨</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="Enter studio, brand, or professional handle"
                          placeholderTextColor="#A3968C"
                          value={businessName}
                          onChangeText={(t) =>
                            handleAlphanumericChange(
                              setBusinessName,
                              'businessName',
                              t,
                              2,
                              'Studio Name'
                            )
                          }
                        />
                      </View>
                      {fieldErrors.businessName ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.businessName}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Creative Medium / Discipline <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View style={[styles.inputPill, fieldErrors.degreeCourse ? styles.inputPillError : null]}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>🎬</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="e.g. Motion Design, Fashion Couture, Video Production"
                          placeholderTextColor="#A3968C"
                          value={degreeCourse}
                          onChangeText={(t) =>
                            handleAlphanumericChange(
                              setDegreeCourse,
                              'degreeCourse',
                              t,
                              2,
                              'Creative Medium'
                            )
                          }
                        />
                      </View>
                      {fieldErrors.degreeCourse ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.degreeCourse}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Portfolio / Instagram / Behance Link <Text style={styles.optionalText}>(Optional)</Text>
                      </Text>
                      <View style={styles.inputPill}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>🔗</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="https://behance.net/yourportfolio"
                          placeholderTextColor="#A3968C"
                          value={portfolioUrl}
                          onChangeText={setPortfolioUrl}
                          autoCapitalize="none"
                        />
                      </View>
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Experience Level <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.dropdownPill,
                          fieldErrors.experienceLevel ? styles.inputPillError : null,
                        ]}
                        activeOpacity={0.8}
                        onPress={() =>
                          openPicker('Experience Level', EXPERIENCE_LEVELS, (val) => {
                            setExperienceLevel(val);
                            updateFieldError('experienceLevel', null);
                          })
                        }
                      >
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>⏳</Text></View>
                        <Text style={[styles.dropdownPillText, !experienceLevel && styles.dropdownPlaceholder]} numberOfLines={1}>
                          {experienceLevel || 'Select years of experience'}
                        </Text>
                        <Text style={styles.chevronIcon}>▼</Text>
                      </TouchableOpacity>
                      {fieldErrors.experienceLevel ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.experienceLevel}</Text>
                      ) : null}
                    </View>
                  </>
                )}

                {/* CASE 7: EMPLOYMENT, COMMUNITY & SOCIAL DEVELOPMENT */}
                {isEmploymentSocial && (
                  <>
                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Target Role / NGO / Organization Name <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View style={[styles.inputPill, fieldErrors.businessName ? styles.inputPillError : null]}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>🤝</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="e.g. Seeking Operations Manager / Gramin Vikas Trust"
                          placeholderTextColor="#A3968C"
                          value={businessName}
                          onChangeText={(t) =>
                            handleAlphanumericChange(
                              setBusinessName,
                              'businessName',
                              t,
                              2,
                              'Target Role / Organization'
                            )
                          }
                        />
                      </View>
                      {fieldErrors.businessName ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.businessName}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Highest Educational Qualification <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View style={[styles.inputPill, fieldErrors.degreeCourse ? styles.inputPillError : null]}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>🎓</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="e.g. Master of Social Work, B.Com, Diploma"
                          placeholderTextColor="#A3968C"
                          value={degreeCourse}
                          onChangeText={(t) =>
                            handleAlphanumericChange(
                              setDegreeCourse,
                              'degreeCourse',
                              t,
                              2,
                              'Qualification'
                            )
                          }
                        />
                      </View>
                      {fieldErrors.degreeCourse ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.degreeCourse}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Core Functional Skills / Domain <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View style={[styles.inputPill, fieldErrors.skillsOrProducts ? styles.inputPillError : null]}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>⭐</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="e.g. Community Mobilization, Operations, Logistics"
                          placeholderTextColor="#A3968C"
                          value={skillsOrProducts}
                          onChangeText={(t) =>
                            handleAlphanumericChange(
                              setSkillsOrProducts,
                              'skillsOrProducts',
                              t,
                              2,
                              'Core Skills'
                            )
                          }
                        />
                      </View>
                      {fieldErrors.skillsOrProducts ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.skillsOrProducts}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Total Experience Level <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.dropdownPill,
                          fieldErrors.experienceLevel ? styles.inputPillError : null,
                        ]}
                        activeOpacity={0.8}
                        onPress={() =>
                          openPicker('Experience Level', EXPERIENCE_LEVELS, (val) => {
                            setExperienceLevel(val);
                            updateFieldError('experienceLevel', null);
                          })
                        }
                      >
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>⏳</Text></View>
                        <Text style={[styles.dropdownPillText, !experienceLevel && styles.dropdownPlaceholder]} numberOfLines={1}>
                          {experienceLevel || 'Select years of experience'}
                        </Text>
                        <Text style={styles.chevronIcon}>▼</Text>
                      </TouchableOpacity>
                      {fieldErrors.experienceLevel ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.experienceLevel}</Text>
                      ) : null}
                    </View>
                  </>
                )}

                {/* CASE 8: MANUFACTURING, INDUSTRIAL, BUSINESS & ENTREPRENEURSHIP (Default Commercial) */}
                {(!isEducation && !isTechnology && !isInvestment && !isProfessional && !isHealthcare && !isAgriculture && !isCreative && !isEmploymentSocial) && (
                  <>
                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Business / Factory / Professional Name <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View style={[styles.inputPill, fieldErrors.businessName ? styles.inputPillError : null]}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>💼</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="Enter business, factory, or company name"
                          placeholderTextColor="#A3968C"
                          value={businessName}
                          onChangeText={(t) =>
                            handleAlphanumericChange(
                              setBusinessName,
                              'businessName',
                              t,
                              2,
                              'Business Name'
                            )
                          }
                        />
                      </View>
                      {fieldErrors.businessName ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.businessName}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Business Entity Type <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.dropdownPill,
                          fieldErrors.businessType ? styles.inputPillError : null,
                        ]}
                        activeOpacity={0.8}
                        onPress={() =>
                          openPicker('Select Business Type', BUSINESS_TYPES, (val) => {
                            setBusinessType(val);
                            updateFieldError('businessType', null);
                          })
                        }
                      >
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>📚</Text></View>
                        <Text style={[styles.dropdownPillText, !businessType && styles.dropdownPlaceholder]} numberOfLines={1}>
                          {businessType || 'Select business type'}
                        </Text>
                        <Text style={styles.chevronIcon}>▼</Text>
                      </TouchableOpacity>
                      {fieldErrors.businessType ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.businessType}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Key Products & Manufacturing / Batch Capacity <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View style={[styles.inputPill, fieldErrors.skillsOrProducts ? styles.inputPillError : null]}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>🏭</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="e.g. Precision CNC Turned Parts, 50k units/month"
                          placeholderTextColor="#A3968C"
                          value={skillsOrProducts}
                          onChangeText={(t) =>
                            handleAlphanumericChange(
                              setSkillsOrProducts,
                              'skillsOrProducts',
                              t,
                              2,
                              'Key Products'
                            )
                          }
                        />
                      </View>
                      {fieldErrors.skillsOrProducts ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.skillsOrProducts}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Years in Operation / Experience <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.dropdownPill,
                          fieldErrors.experienceLevel ? styles.inputPillError : null,
                        ]}
                        activeOpacity={0.8}
                        onPress={() =>
                          openPicker('Experience Level', EXPERIENCE_LEVELS, (val) => {
                            setExperienceLevel(val);
                            updateFieldError('experienceLevel', null);
                          })
                        }
                      >
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>⏳</Text></View>
                        <Text style={[styles.dropdownPillText, !experienceLevel && styles.dropdownPlaceholder]} numberOfLines={1}>
                          {experienceLevel || 'Select years in operation'}
                        </Text>
                        <Text style={styles.chevronIcon}>▼</Text>
                      </TouchableOpacity>
                      {fieldErrors.experienceLevel ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.experienceLevel}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        GSTIN / Udyam Number <Text style={styles.optionalText}>(Optional)</Text>
                      </Text>
                      <View style={[styles.inputPill, fieldErrors.gstin ? styles.inputPillError : null]}>
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>🏛️</Text></View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="e.g. 33AAAAA0000A1Z5 or UDYAM-TN-03-0001234"
                          placeholderTextColor="#A3968C"
                          value={gstin}
                          onChangeText={handleGstinChange}
                          autoCapitalize="characters"
                        />
                      </View>
                      {fieldErrors.gstin ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.gstin}</Text>
                      ) : null}
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>
                        Annual Turnover Scale <Text style={styles.optionalText}>(Optional)</Text>
                      </Text>
                      <TouchableOpacity
                        style={styles.dropdownPill}
                        activeOpacity={0.8}
                        onPress={() => openPicker('Annual Turnover Scale', TURNOVER_RANGES, setTurnover)}
                      >
                        <View style={styles.iconBox}><Text style={styles.iconEmoji}>📊</Text></View>
                        <Text style={[styles.dropdownPillText, !turnover && styles.dropdownPlaceholder]} numberOfLines={1}>
                          {turnover || 'Select turnover bracket'}
                        </Text>
                        <Text style={styles.chevronIcon}>▼</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {/* 3. Common Address & Location (MD Blueprint Section 2.4 & 3.6) */}
                <View style={[styles.fieldBlock, { marginTop: 16 }]}>
                  <Text style={styles.fieldLabel}>
                    Street Address / Locality <Text style={styles.requiredStar}>* (Min 5 chars)</Text>
                  </Text>
                  <View style={[styles.inputPill, fieldErrors.streetAddress ? styles.inputPillError : null]}>
                    <View style={styles.iconBox}>
                      <Text style={styles.iconEmoji}>🏠</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Premise, building, street, or industrial area"
                      placeholderTextColor="#A3968C"
                      value={streetAddress}
                      onChangeText={(t) => {
                        const sanitized = t.replace(/[^a-zA-Z0-9\s,.\-#/()]/g, '');
                        setStreetAddress(sanitized);
                        if (!sanitized.trim()) {
                          updateFieldError('streetAddress', 'Street address is required');
                        } else if (sanitized.trim().length < 5) {
                          updateFieldError('streetAddress', 'Street address must be at least 5 characters');
                        } else {
                          updateFieldError('streetAddress', null);
                        }
                      }}
                    />
                  </View>
                  {fieldErrors.streetAddress ? (
                    <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.streetAddress}</Text>
                  ) : null}
                </View>

                {/* 1. State */}
                <View style={[styles.fieldBlock, { marginTop: 14 }]}>
                  <Text style={styles.fieldLabel}>
                    State <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[styles.dropdownPill, fieldErrors.stateRegion ? styles.inputPillError : null]}
                    activeOpacity={0.8}
                    onPress={() =>
                      openPicker('Select State', STATES, (val) => {
                        setStateRegion(val);
                        setDistrict('');
                        setCustomDistrict('');
                        updateFieldError('stateRegion', null);
                        updateFieldError('district', null);
                      })
                    }
                  >
                    <View style={styles.iconBox}>
                      <Text style={styles.iconEmoji}>🗺️</Text>
                    </View>
                    <Text
                      style={[
                        styles.dropdownPillText,
                        !stateRegion && styles.dropdownPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {stateRegion || 'Select State'}
                    </Text>
                    <Text style={styles.chevronIcon}>▼</Text>
                  </TouchableOpacity>
                  {fieldErrors.stateRegion ? (
                    <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.stateRegion}</Text>
                  ) : null}
                </View>

                {/* 2. District (Dynamically loaded based on State) */}
                <View style={[styles.fieldBlock, { marginTop: 14 }]}>
                  <Text style={styles.fieldLabel}>
                    District <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[styles.dropdownPill, fieldErrors.district ? styles.inputPillError : null]}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (!stateRegion) {
                        updateFieldError('district', 'Please select State first');
                        return;
                      }
                      const distList = STATE_DISTRICTS[stateRegion] || DEFAULT_DISTRICTS;
                      openPicker(`Select District (${stateRegion})`, distList, (val) => {
                        setDistrict(val);
                        updateFieldError('district', null);
                        if (val !== 'Other District') {
                          setCustomDistrict('');
                          updateFieldError('customDistrict', null);
                        }
                      });
                    }}
                  >
                    <View style={styles.iconBox}>
                      <Text style={styles.iconEmoji}>📍</Text>
                    </View>
                    <Text
                      style={[
                        styles.dropdownPillText,
                        !district && styles.dropdownPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {district || (stateRegion ? `Select District in ${stateRegion}` : 'Select State first')}
                    </Text>
                    <Text style={styles.chevronIcon}>▼</Text>
                  </TouchableOpacity>
                  {fieldErrors.district ? (
                    <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.district}</Text>
                  ) : null}
                </View>

                {/* If Other District is selected: Custom district entry */}
                {district === 'Other District' && (
                  <View style={[styles.fieldBlock, { marginTop: 12 }]}>
                    <Text style={styles.fieldLabel}>
                      Specify District Name <Text style={styles.requiredStar}>* (Text only, min 2 chars)</Text>
                    </Text>
                    <View style={[styles.inputPill, fieldErrors.customDistrict ? styles.inputPillError : null]}>
                      <View style={styles.iconBox}>
                        <Text style={styles.iconEmoji}>🏛️</Text>
                      </View>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter district name"
                        placeholderTextColor="#A3968C"
                        value={customDistrict}
                        onChangeText={(t) => {
                          const sanitized = t.replace(/[^a-zA-Z\s.-]/g, '');
                          setCustomDistrict(sanitized);
                          if (!sanitized.trim()) {
                            updateFieldError('customDistrict', 'District name is required');
                          } else if (sanitized.trim().length < 2) {
                            updateFieldError('customDistrict', 'District name must be at least 2 characters');
                          } else {
                            updateFieldError('customDistrict', null);
                          }
                        }}
                        autoCapitalize="words"
                      />
                    </View>
                    {fieldErrors.customDistrict ? (
                      <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.customDistrict}</Text>
                    ) : null}
                  </View>
                )}

                {/* 3. City */}
                <View style={[styles.fieldBlock, { marginTop: 14 }]}>
                  <Text style={styles.fieldLabel}>
                    City <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={[styles.inputPill, fieldErrors.city ? styles.inputPillError : null]}>
                    <View style={styles.iconBox}>
                      <Text style={styles.iconEmoji}>🏙️</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter city / town name"
                      placeholderTextColor="#A3968C"
                      value={city}
                      onChangeText={(t) => {
                        const sanitized = t.replace(/[^a-zA-Z\s.-]/g, '');
                        setCity(sanitized);
                        if (!sanitized.trim()) {
                          updateFieldError('city', 'City name is required');
                        } else if (sanitized.trim().length < 2) {
                          updateFieldError('city', 'City name must contain at least 2 letters');
                        } else {
                          updateFieldError('city', null);
                        }
                      }}
                      autoCapitalize="words"
                    />
                  </View>
                  {fieldErrors.city ? (
                    <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.city}</Text>
                  ) : null}
                </View>

                {/* 4. Postal PIN Code (Number-only, strictly 6 digits) */}
                <View style={[styles.fieldBlock, { marginTop: 14 }]}>
                  <Text style={styles.fieldLabel}>
                    Postal PIN Code <Text style={styles.requiredStar}>* (6 digits only)</Text>
                  </Text>
                  <View style={[styles.inputPill, fieldErrors.pincode ? styles.inputPillError : null]}>
                    <View style={styles.iconBox}>
                      <Text style={styles.iconEmoji}>📮</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 641004"
                      placeholderTextColor="#A3968C"
                      value={pincode}
                      onChangeText={handlePincodeChange}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                  {fieldErrors.pincode ? (
                    <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.pincode}</Text>
                  ) : null}
                </View>

                {/* 4. Short Description */}
                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>
                    Short Description <Text style={styles.requiredStar}>* (Min 10 characters)</Text>
                  </Text>
                  <View style={[styles.textareaPill, fieldErrors.description ? styles.inputPillError : null]}>
                    <View style={[styles.iconBox, { marginTop: 4 }]}>
                      <Text style={styles.iconEmoji}>📝</Text>
                    </View>
                    <TextInput
                      style={styles.textareaInput}
                      placeholder={
                        isEducation
                          ? 'Briefly describe your career goals or research interests (min 10 chars)'
                          : isInvestment
                          ? 'Briefly describe your investment focus and target stage (min 10 chars)'
                          : 'Briefly describe your business or work (min 10 chars, max 200)'
                      }
                      placeholderTextColor="#A3968C"
                      multiline
                      maxLength={200}
                      value={description}
                      onChangeText={(t) => {
                        setDescription(t);
                        if (!t.trim()) {
                          updateFieldError('description', 'Description is required');
                        } else if (t.trim().length < 10) {
                          updateFieldError('description', 'Description must be at least 10 characters');
                        } else {
                          updateFieldError('description', null);
                        }
                      }}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    {fieldErrors.description ? (
                      <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.description}</Text>
                    ) : <View />}
                    <Text style={styles.charCounter}>{description.length} / 200</Text>
                  </View>
                </View>

                {/* Action Buttons Row */}
                <View style={styles.dualButtonsRow}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    activeOpacity={0.88}
                    onPress={() => setCurrentStep(1)}
                  >
                    <Text style={styles.secondaryButtonText}>← Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.primaryButton, { flex: 1, marginLeft: 12 }]}
                    activeOpacity={0.88}
                    onPress={handleNextFromStep2}
                  >
                    <Text style={styles.primaryButtonText}>Continue  →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ============================================================== */}
            {/* STEP 3: IDENTITY VERIFICATION                                 */}
            {/* ============================================================== */}
            {currentStep === 3 && (
              <View style={styles.stepContent}>
                <Text style={styles.sectionHeader}>Step 3 of 4: Identity Verification</Text>
                <Text style={styles.sectionSubtext}>
                  Verify your identity to keep the platform secure and trusted.
                </Text>

                <Text style={[styles.fieldLabel, { marginTop: 12, marginBottom: 8 }]}>
                  Choose Verification Method <Text style={styles.requiredStar}>*</Text>
                </Text>

                {/* 2 Method Cards */}
                <View style={styles.methodsRow}>
                  {/* Card A: Aadhaar */}
                  <TouchableOpacity
                    style={[
                      styles.methodCard,
                      verificationMethod === 'AADHAAR' && styles.methodCardSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => {
                      setVerificationMethod('AADHAAR');
                      setPrimaryDoc(null);
                      setIdNumber('');
                      updateFieldError('idNumber', null);
                      updateFieldError('primaryDoc', null);
                    }}
                  >
                    <View style={styles.methodCardHeader}>
                      <View style={styles.methodIconBadge}>
                        <Text style={styles.methodEmoji}>🪪</Text>
                      </View>
                      <View
                        style={[
                          styles.radioCircle,
                          verificationMethod === 'AADHAAR' && styles.radioCircleSelected,
                        ]}
                      >
                        {verificationMethod === 'AADHAAR' && (
                          <Text style={styles.radioCheckmark}>✓</Text>
                        )}
                      </View>
                    </View>
                    <Text style={styles.methodTitle}>Aadhaar Verification</Text>
                    <Text style={styles.methodSubtitle}>Instant 12-digit biometric ID check</Text>
                  </TouchableOpacity>

                  {/* Card B: Alternate ID */}
                  <TouchableOpacity
                    style={[
                      styles.methodCard,
                      verificationMethod === 'ALTERNATE' && styles.methodCardSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => {
                      setVerificationMethod('ALTERNATE');
                      setPrimaryDoc(null);
                      setIdNumber('');
                      updateFieldError('idNumber', null);
                      updateFieldError('primaryDoc', null);
                    }}
                  >
                    <View style={styles.methodCardHeader}>
                      <View style={styles.methodIconBadge}>
                        <Text style={styles.methodEmoji}>💳</Text>
                      </View>
                      <View
                        style={[
                          styles.radioCircle,
                          verificationMethod === 'ALTERNATE' && styles.radioCircleSelected,
                        ]}
                      >
                        {verificationMethod === 'ALTERNATE' && (
                          <Text style={styles.radioCheckmark}>✓</Text>
                        )}
                      </View>
                    </View>
                    <Text style={styles.methodTitle}>Alternate ID</Text>
                    <Text style={styles.methodSubtitle}>PAN / Voter ID / Govt ID</Text>
                  </TouchableOpacity>
                </View>

                {/* ID Number Input */}
                <View style={[styles.fieldBlock, { marginTop: 16 }]}>
                  <Text style={styles.fieldLabel}>
                    {verificationMethod === 'AADHAAR'
                      ? 'Enter 12-Digit Aadhaar Number (Numbers only)'
                      : 'Enter PAN / Govt ID Number (Alphanumeric)'}{' '}
                    <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={[styles.inputPill, fieldErrors.idNumber ? styles.inputPillError : null]}>
                    <View style={styles.iconBox}>
                      <Text style={styles.iconEmoji}>🔒</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder={
                        verificationMethod === 'AADHAAR'
                          ? '12-digit number (e.g. 876543234567)'
                          : 'e.g. ABCDE1234F'
                      }
                      placeholderTextColor="#A3968C"
                      value={idNumber}
                      onChangeText={handleIdNumberChange}
                      keyboardType={verificationMethod === 'AADHAAR' ? 'number-pad' : 'default'}
                      autoCapitalize="characters"
                      maxLength={verificationMethod === 'AADHAAR' ? 12 : 16}
                    />
                  </View>
                  {fieldErrors.idNumber ? (
                    <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.idNumber}</Text>
                  ) : null}
                </View>

                {/* 1. Primary Identity Document Upload (Image 1 reference design) */}
                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>
                    {getPrimaryDocLabel()} <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  {primaryDoc ? (
                    <View style={styles.attachedCardContainer}>
                      <TouchableOpacity
                        style={styles.uploadBoxDone}
                        activeOpacity={0.85}
                        onPress={() => handleOpenDocPicker('PRIMARY')}
                      >
                        <View style={styles.uploadDoneIconBox}>
                          <Text style={styles.uploadDoneCheckIcon}>✓</Text>
                        </View>
                        <Text style={styles.uploadedFileName}>
                          {primaryDoc.name} ({primaryDoc.size})
                        </Text>
                        <Text style={styles.uploadSuccessText}>Attached • Tap to change</Text>
                      </TouchableOpacity>
                      <View style={styles.docActionRow}>
                        <TouchableOpacity
                          style={styles.docActionBtn}
                          onPress={() => handlePreviewDoc(primaryDoc, getPrimaryDocLabel())}
                        >
                          <Text style={styles.docActionText}>👁️ Preview</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.docActionBtn}
                          onPress={() => handleOpenDocPicker('PRIMARY')}
                        >
                          <Text style={styles.docActionText}>🔄 Replace</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.docActionBtn, styles.docActionBtnDanger]}
                          onPress={() => handleRemoveDoc('PRIMARY')}
                        >
                          <Text style={[styles.docActionText, styles.docActionTextDanger]}>🗑️ Remove</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.uploadBox,
                        fieldErrors.primaryDoc ? styles.uploadBoxError : null,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => handleOpenDocPicker('PRIMARY')}
                    >
                      <View style={styles.uploadIconCircle}>
                        <Text style={styles.uploadIconEmoji}>☁️</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={styles.uploadHeadline}>Tap to Upload Proof</Text>
                        <Text style={styles.uploadSubtext}>
                          Camera, Gallery, or Document (PDF, JPG, PNG — Max 5 MB)
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  {fieldErrors.primaryDoc ? (
                    <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.primaryDoc}</Text>
                  ) : null}
                </View>

                {/* 2. Dynamic Mandatory Category Document Upload (per Section 2 & MD Blueprint) */}
                {isCategoryDocRequired() && (
                  <View style={[styles.fieldBlock, { marginTop: 14 }]}>
                    {/* Document Number Field (Added directly above upload field per requirement) */}
                    <View style={{ marginBottom: 14 }}>
                      <Text style={styles.fieldLabel}>
                        {getCategoryDocNumberConfig().label} <Text style={styles.requiredStar}>* (Alphanumeric)</Text>
                      </Text>
                      <View
                        style={[
                          styles.inputPill,
                          fieldErrors.categoryDocNumber ? styles.inputPillError : null,
                        ]}
                      >
                        <View style={styles.iconBox}>
                          <Text style={styles.iconEmoji}>{getCategoryDocNumberConfig().emoji}</Text>
                        </View>
                        <TextInput
                          style={styles.textInput}
                          placeholder={getCategoryDocNumberConfig().placeholder}
                          placeholderTextColor="#A3968C"
                          value={categoryDocNumber}
                          onChangeText={(t) => {
                            const sanitized = t.replace(/[^a-zA-Z0-9\-_/]/g, '').toUpperCase();
                            setCategoryDocNumber(sanitized);
                            if (!sanitized.trim()) {
                              updateFieldError('categoryDocNumber', getCategoryDocNumberConfig().errorMsg);
                            } else if (sanitized.trim().length < 3) {
                              updateFieldError('categoryDocNumber', 'Document Number must be at least 3 characters');
                            } else {
                              updateFieldError('categoryDocNumber', null);
                            }
                          }}
                          autoCapitalize="characters"
                          maxLength={getCategoryDocNumberConfig().maxLength}
                        />
                      </View>
                      {fieldErrors.categoryDocNumber ? (
                        <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.categoryDocNumber}</Text>
                      ) : null}
                    </View>

                    <Text style={styles.fieldLabel}>
                      {getCategoryDocLabel()} <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    {categoryDoc ? (
                      <View style={styles.attachedCardContainer}>
                        <TouchableOpacity
                          style={styles.uploadBoxDone}
                          activeOpacity={0.85}
                          onPress={() => handleOpenDocPicker('CATEGORY')}
                        >
                          <View style={styles.uploadDoneIconBox}>
                            <Text style={styles.uploadDoneCheckIcon}>✓</Text>
                          </View>
                          <Text style={styles.uploadedFileName}>
                            {categoryDoc.name} ({categoryDoc.size})
                          </Text>
                          <Text style={styles.uploadSuccessText}>Attached • Tap to change</Text>
                        </TouchableOpacity>
                        <View style={styles.docActionRow}>
                          <TouchableOpacity
                            style={styles.docActionBtn}
                            onPress={() => handlePreviewDoc(categoryDoc, getCategoryDocLabel())}
                          >
                            <Text style={styles.docActionText}>👁️ Preview</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.docActionBtn}
                            onPress={() => handleOpenDocPicker('CATEGORY')}
                          >
                            <Text style={styles.docActionText}>🔄 Replace</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.docActionBtn, styles.docActionBtnDanger]}
                            onPress={() => handleRemoveDoc('CATEGORY')}
                          >
                            <Text style={[styles.docActionText, styles.docActionTextDanger]}>🗑️ Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.uploadBox,
                          fieldErrors.categoryDoc ? styles.uploadBoxError : null,
                        ]}
                        activeOpacity={0.85}
                        onPress={() => handleOpenDocPicker('CATEGORY')}
                      >
                        <View style={styles.uploadIconCircle}>
                          <Text style={styles.uploadIconEmoji}>🏫</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={styles.uploadHeadline}>Tap to Upload Category Proof</Text>
                          <Text style={styles.uploadSubtext}>
                            Institutional ID / Degree / Business Certificate (PDF, JPG, PNG — Max 5 MB)
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    {fieldErrors.categoryDoc ? (
                      <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.categoryDoc}</Text>
                    ) : null}
                  </View>
                )}

                {/* Action Buttons Row */}
                <View style={styles.dualButtonsRow}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    activeOpacity={0.88}
                    onPress={() => setCurrentStep(2)}
                  >
                    <Text style={styles.secondaryButtonText}>← Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.primaryButton, { flex: 1, marginLeft: 12 }]}
                    activeOpacity={0.88}
                    onPress={handleNextFromStep3}
                  >
                    <Text style={styles.primaryButtonText}>Continue  →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ============================================================== */}
            {/* STEP 4: MEMBERSHIP PAYMENT & TERMS                             */}
            {/* ============================================================== */}
            {currentStep === 4 && (
              <View style={styles.stepContent}>
                <Text style={styles.sectionHeader}>Step 4 of 4: Membership Payment</Text>
                <Text style={styles.sectionSubtext}>
                  Activate your membership and start your business journey today.
                </Text>

                {/* ₹99 Membership Plan Card */}
                <View style={styles.membershipCard}>
                  {/* Top Bar with Crown & Tag */}
                  <View style={styles.planCardTop}>
                    <View style={styles.planBadgeContainer}>
                      <View style={styles.planCrownCircle}>
                        <Text style={styles.planCrownEmoji}>👑</Text>
                      </View>
                      <Text style={styles.planBadgeTitle}>Membership Plan</Text>
                    </View>
                    <View style={styles.mostPopularPill}>
                      <Text style={styles.mostPopularPillText}>One Year Membership</Text>
                    </View>
                  </View>

                  {/* Pricing Row */}
                  <View style={styles.planPriceRow}>
                    <Text style={styles.planPriceBig}>₹99</Text>
                    <View style={{ marginLeft: 8, justifyContent: 'center' }}>
                      <Text style={styles.planPriceSub}>First-Year Introductory Offer</Text>
                      <Text style={{ fontSize: 11, color: '#7A6E65', fontWeight: '500' }}>
                        (Inclusive of applicable taxes)
                      </Text>
                    </View>
                  </View>

                  {/* Blueprint Section 2.4 & 4.4 Terms & Renewal Disclosure */}
                  <View
                    style={{
                      backgroundColor: '#FAF5EE',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 9,
                      marginTop: 8,
                      borderWidth: 1,
                      borderColor: '#EFE7DA',
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#453A33', fontWeight: '600', lineHeight: 17 }}>
                      • Annual renewal from 2nd year onwards:{' '}
                      <Text style={{ fontWeight: '800', color: '#0C4E3D' }}>₹5,999/year</Text>
                    </Text>
                    <Text style={{ fontSize: 11, color: '#7A6E65', marginTop: 3 }}>
                      • Full ecosystem access across all 10 business sectors with FIC Intermediary facilitation.
                    </Text>
                  </View>

                  {/* Checklist Divider */}
                  <View style={styles.cardDivider} />

                  {/* 6 Benefit Items with Checkmarks */}
                  <View style={styles.benefitsList}>
                    {[
                      'Access to all business categories',
                      'Post business requirements & offers',
                      'Get matched business opportunities',
                      'Attend virtual business meetings',
                      'Access learning & mentor videos',
                      'Participate in investment opportunities',
                    ].map((item, idx) => (
                      <View key={idx} style={styles.benefitRow}>
                        <View style={styles.benefitCheck}>
                          <Text style={styles.benefitCheckmark}>✓</Text>
                        </View>
                        <Text style={styles.benefitText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Choose Payment Method */}
                <Text style={[styles.fieldLabel, { marginTop: 16, marginBottom: 8 }]}>
                  Choose Payment Method
                </Text>

                <View style={styles.paymentMethodsRow}>
                  {/* Option 1: UPI / QR */}
                  <TouchableOpacity
                    style={[
                      styles.paymentOptionCard,
                      paymentMethod === 'UPI' && styles.paymentOptionSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setPaymentMethod('UPI')}
                  >
                    {paymentMethod === 'UPI' && (
                      <View style={styles.paymentCheckCircle}>
                        <Text style={styles.paymentCheckIcon}>✓</Text>
                      </View>
                    )}
                    <Text style={styles.paymentOptionEmoji}>📱</Text>
                    <Text style={styles.paymentOptionLabel}>UPI / QR</Text>
                  </TouchableOpacity>

                  {/* Option 2: Card */}
                  <TouchableOpacity
                    style={[
                      styles.paymentOptionCard,
                      paymentMethod === 'CARD' && styles.paymentOptionSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setPaymentMethod('CARD')}
                  >
                    {paymentMethod === 'CARD' && (
                      <View style={styles.paymentCheckCircle}>
                        <Text style={styles.paymentCheckIcon}>✓</Text>
                      </View>
                    )}
                    <Text style={styles.paymentOptionEmoji}>💳</Text>
                    <Text style={styles.paymentOptionLabel}>Debit / Credit{'\n'}Card</Text>
                  </TouchableOpacity>

                  {/* Option 3: Net Banking */}
                  <TouchableOpacity
                    style={[
                      styles.paymentOptionCard,
                      paymentMethod === 'NET_BANKING' && styles.paymentOptionSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setPaymentMethod('NET_BANKING')}
                  >
                    {paymentMethod === 'NET_BANKING' && (
                      <View style={styles.paymentCheckCircle}>
                        <Text style={styles.paymentCheckIcon}>✓</Text>
                      </View>
                    )}
                    <Text style={styles.paymentOptionEmoji}>🏦</Text>
                    <Text style={styles.paymentOptionLabel}>Net Banking</Text>
                  </TouchableOpacity>
                </View>

                {/* Terms and Conditions Checkbox */}
                <TouchableOpacity
                  style={styles.termsRow}
                  activeOpacity={0.8}
                  onPress={() => {
                    const nextVal = !agreedTerms;
                    setAgreedTerms(nextVal);
                    if (nextVal) {
                      updateFieldError('terms', null);
                    }
                  }}
                >
                  <View style={[styles.termsCheckbox, agreedTerms && styles.termsCheckboxChecked]}>
                    {agreedTerms && <Text style={styles.termsCheckmark}>✓</Text>}
                  </View>
                  <Text style={styles.termsText}>
                    I agree to the <Text style={styles.termsLink}>FIC Platform Terms</Text> & Verification Guidelines.
                  </Text>
                </TouchableOpacity>
                {fieldErrors.terms ? (
                  <Text style={[styles.fieldErrorText, { marginBottom: 8 }]}>
                    ⚠️ {fieldErrors.terms}
                  </Text>
                ) : null}

                {/* Action Buttons Row */}
                <View style={[styles.dualButtonsRow, { marginTop: 16 }]}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    activeOpacity={0.88}
                    onPress={() => setCurrentStep(3)}
                    disabled={isProcessingPayment}
                  >
                    <Text style={styles.secondaryButtonText}>← Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.primaryButton, { flex: 1, marginLeft: 12 }]}
                    activeOpacity={0.88}
                    onPress={handleProcessPayment}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Pay ₹99  →</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Bottom Wave Graphic */}
          <View style={styles.bottomWaveContainer}>
            <Image
              source={require('../../assets/images/bottom_waves.png')}
              style={styles.bottomWaveImage}
              resizeMode="stretch"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ============================================================== */}
      {/* INTERACTIVE DATE OF BIRTH PICKER MODAL (18+ ENFORCED)          */}
      {/* ============================================================== */}
      <Modal
        visible={datePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Date of Birth</Text>
                <Text style={styles.modalSubtitle}>18+ Years Required (Born on or before Nov 2008)</Text>
              </View>
              <TouchableOpacity
                onPress={() => setDatePickerVisible(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 3 Column Wheels / Selectors */}
            <View style={styles.datePickerColumnsRow}>
              {/* Day Column */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.dateColumnHeader}>Day</Text>
                <ScrollView style={styles.dateColumnScroll} showsVerticalScrollIndicator={false}>
                  {eligibleDays.map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.datePillItem,
                        pickerDay === d && styles.datePillItemActive,
                      ]}
                      onPress={() => setPickerDay(d)}
                    >
                      <Text
                        style={[
                          styles.datePillText,
                          pickerDay === d && styles.datePillTextActive,
                        ]}
                      >
                        {String(d).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month Column */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.dateColumnHeader}>Month</Text>
                <ScrollView style={styles.dateColumnScroll} showsVerticalScrollIndicator={false}>
                  {MONTH_NAMES.map((name, idx) => {
                    const mNum = idx + 1;
                    return (
                      <TouchableOpacity
                        key={mNum}
                        style={[
                          styles.datePillItem,
                          pickerMonth === mNum && styles.datePillItemActive,
                        ]}
                        onPress={() => setPickerMonth(mNum)}
                      >
                        <Text
                          style={[
                            styles.datePillText,
                            pickerMonth === mNum && styles.datePillTextActive,
                          ]}
                        >
                          {name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Year Column */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.dateColumnHeader}>Year</Text>
                <ScrollView style={styles.dateColumnScroll} showsVerticalScrollIndicator={false}>
                  {eligibleYears.map((yr) => (
                    <TouchableOpacity
                      key={yr}
                      style={[
                        styles.datePillItem,
                        pickerYear === yr && styles.datePillItemActive,
                      ]}
                      onPress={() => setPickerYear(yr)}
                    >
                      <Text
                        style={[
                          styles.datePillText,
                          pickerYear === yr && styles.datePillTextActive,
                        ]}
                      >
                        {yr}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Live Age Badge Preview */}
            <View style={styles.ageIndicatorCard}>
              <Text style={styles.ageIndicatorText}>
                Selected: {String(pickerDay).padStart(2, '0')} {MONTH_NAMES[pickerMonth - 1]} {pickerYear}
              </Text>
              <Text style={styles.ageEligibilityText}>
                🎂 Age: {modalCalculatedAge} Years Old • Eligible to Register ✓
              </Text>
            </View>

            {/* Confirm Date Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.88}
              onPress={handleConfirmDatePicker}
            >
              <Text style={styles.primaryButtonText}>Confirm Date of Birth</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* GENERIC DROPDOWN PICKER MODAL                                  */}
      {/* ============================================================== */}
      <Modal
        visible={pickerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{pickerTitle}</Text>
              <TouchableOpacity
                onPress={() => setPickerModalVisible(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 360 }}>
              {pickerOptions.map((opt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.pickerOptionRow}
                  activeOpacity={0.7}
                  onPress={() => onSelectOption(opt)}
                >
                  <Text style={styles.pickerOptionText}>{opt}</Text>
                  <Text style={styles.pickerOptionArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* SUCCESS / TRACKING CONFIRMATION MODAL                          */}
      {/* ============================================================== */}
      <Modal
        visible={isSubmittedSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalCard}>
            <View style={styles.successShield}>
              <Text style={styles.successCheckmark}>✓</Text>
            </View>

            <Text style={styles.successTitle}>Registration & Payment Successful!</Text>
            <Text style={styles.successSubtitle}>
              Welcome to the FIC Business Hub ecosystem.
            </Text>

            <View style={styles.trackingBox}>
              <View style={styles.trackingRow}>
                <Text style={styles.trackingLabel}>Application ID:</Text>
                <Text style={styles.trackingValue}>FIC-REG-2026-9812</Text>
              </View>
              <View style={styles.trackingRow}>
                <Text style={styles.trackingLabel}>Payment Status:</Text>
                <Text style={[styles.trackingValue, { color: '#0C4E3D' }]}>
                  ₹99 Paid (Active)
                </Text>
              </View>
              <View style={styles.trackingRow}>
                <Text style={styles.trackingLabel}>KYC Status:</Text>
                <Text style={[styles.trackingValue, { color: '#C88536' }]}>
                  Under Review
                </Text>
              </View>
              <View style={styles.trackingRow}>
                <Text style={styles.trackingLabel}>Role / Category:</Text>
                <Text style={styles.trackingValue} numberOfLines={1}>
                  {selectedCategory || 'Business & Entrepreneurship'}
                </Text>
              </View>
              {selectedSubCategory ? (
                <View style={styles.trackingRow}>
                  <Text style={styles.trackingLabel}>Sector / Track:</Text>
                  <Text style={styles.trackingValue} numberOfLines={1}>
                    {selectedSubCategory}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.verificationDeskNotice}>
              Your documents have been submitted to the FIC Verification Desk. Verification typically completes within 24–48 business hours.
            </Text>

            <TouchableOpacity
              style={[styles.primaryButton, { width: '100%', marginTop: 20 }]}
              activeOpacity={0.88}
              onPress={() => {
                setIsSubmittedSuccess(false);
                const subLower = selectedSubCategory?.toLowerCase() || '';
                const isMentorCat =
                  subLower === 'mentor' ||
                  subLower === 'mentor / trainer' ||
                  subLower === 'mentor/trainer' ||
                  subLower === 'trainer' ||
                  subLower === 'teacher' ||
                  subLower === 'professor' ||
                  subLower === 'teacher / professor' ||
                  subLower === 'teacher/professor';
                const isStudentCat = !isMentorCat && subLower === 'student';
                const assignedCategory = selectedCategory || ((isMentorCat || isStudentCat) ? 'Education & Knowledge' : 'Technology & Digital');
                
                if (referralCodeInput && registerReferralFunc) {
                  registerReferralFunc(referralCodeInput, fullName || 'Rahul Sharma', assignedCategory);
                }

                const effectiveDistrict = district === 'Other District' ? customDistrict.trim() : district.trim();
                onRegistrationComplete({
                  fullName: fullName || 'Rahul Sharma',
                  category: assignedCategory,
                  subCategory: selectedSubCategory || (isMentorCat ? 'Mentor / Trainer' : isStudentCat ? 'Student' : 'Software Developer'),
                  role: isMentorCat ? 'MENTOR' : isStudentCat ? 'STUDENT' : isProfessional ? 'MENTOR' : 'MSME',
                  dob,
                  streetAddress: streetAddress.trim(),
                  stateRegion: stateRegion.trim(),
                  district: effectiveDistrict,
                  city: city.trim(),
                  pincode: pincode.trim(),
                  categoryDocNumber: categoryDocNumber.trim(),
                });
              }}
            >
              <Text style={styles.primaryButtonText}>Go to Member Dashboard  →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* NATIVE DOCUMENT / IMAGE PICKER SHEET MODAL                     */}
      {/* ============================================================== */}
      <Modal
        visible={docPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDocPickerVisible(false)}
      >
        <View style={styles.pickerBackdrop}>
          <View style={styles.docPickerSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Choose Document Source</Text>
            <Text style={styles.sheetSub}>
              {docPickerTarget === 'PRIMARY' ? getPrimaryDocLabel() : getCategoryDocLabel()}
            </Text>

            <TouchableOpacity
              style={styles.sheetOption}
              activeOpacity={0.7}
              onPress={() => handleSelectDocSource('CAMERA')}
            >
              <View style={[styles.sheetIconCircle, { backgroundColor: '#EEF2FF' }]}>
                <Text style={styles.sheetEmoji}>📷</Text>
              </View>
              <View style={styles.sheetOptionText}>
                <Text style={styles.sheetOptionTitle}>Take Photo with Camera</Text>
                <Text style={styles.sheetOptionDesc}>Capture clear photo of physical ID</Text>
              </View>
              <Text style={styles.sheetChevron}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetOption}
              activeOpacity={0.7}
              onPress={() => handleSelectDocSource('GALLERY')}
            >
              <View style={[styles.sheetIconCircle, { backgroundColor: '#F0FDF4' }]}>
                <Text style={styles.sheetEmoji}>🖼️</Text>
              </View>
              <View style={styles.sheetOptionText}>
                <Text style={styles.sheetOptionTitle}>Choose from Gallery</Text>
                <Text style={styles.sheetOptionDesc}>Select JPG or PNG from photos</Text>
              </View>
              <Text style={styles.sheetChevron}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetOption}
              activeOpacity={0.7}
              onPress={() => handleSelectDocSource('DOCUMENT')}
            >
              <View style={[styles.sheetIconCircle, { backgroundColor: '#FFFBEB' }]}>
                <Text style={styles.sheetEmoji}>📄</Text>
              </View>
              <View style={styles.sheetOptionText}>
                <Text style={styles.sheetOptionTitle}>Choose PDF / Document</Text>
                <Text style={styles.sheetOptionDesc}>Select PDF document (Max 5 MB)</Text>
              </View>
              <Text style={styles.sheetChevron}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetCancelBtn}
              activeOpacity={0.8}
              onPress={() => setDocPickerVisible(false)}
            >
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* DOCUMENT PREVIEW MODAL                                         */}
      {/* ============================================================== */}
      <Modal
        visible={previewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewModalVisible(false)}
      >
        <View style={styles.pickerBackdrop}>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.previewHeaderTitle}>Document Preview</Text>
                <Text style={styles.previewHeaderSub}>{previewDocTitle}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setPreviewModalVisible(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.previewDocVisual}>
              {previewDoc?.uri &&
              (previewDoc.type.startsWith('image') ||
                previewDoc.name.toLowerCase().endsWith('.jpg') ||
                previewDoc.name.toLowerCase().endsWith('.jpeg') ||
                previewDoc.name.toLowerCase().endsWith('.png')) ? (
                <View style={styles.previewImageContainer}>
                  <Image
                    source={{ uri: previewDoc.uri }}
                    style={styles.previewImageThumb}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <View style={styles.previewFileIcon}>
                  <Text style={{ fontSize: 36 }}>
                    {previewDoc?.type.includes('pdf') || previewDoc?.name.toLowerCase().endsWith('.pdf')
                      ? '📑'
                      : '🪪'}
                  </Text>
                </View>
              )}
              <Text style={styles.previewDocName} numberOfLines={2}>
                {previewDoc?.name}
              </Text>
              <View style={styles.previewBadge}>
                <Text style={styles.previewBadgeText}>✓ Ready for KYC Verification</Text>
              </View>
              <View style={styles.previewMetaBox}>
                <Text style={styles.previewMetaItem}>File Size: {previewDoc?.size}</Text>
                <Text style={styles.previewMetaItem}>Format: {previewDoc?.type}</Text>
                <Text style={styles.previewMetaItem}>Source: {previewDoc?.source}</Text>
                <Text style={styles.previewMetaItem}>Status: {previewDoc?.status || 'Attached'}</Text>
                <Text style={styles.previewMetaItem}>Attached at: {previewDoc?.timestamp}</Text>
              </View>

              {previewDoc?.uri ? (
                <TouchableOpacity
                  style={styles.previewOpenExtBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (previewDoc.uri) {
                      Linking.openURL(previewDoc.uri).catch((err) => {
                        console.warn('Unable to open URL:', err);
                      });
                    }
                  }}
                >
                  <Text style={styles.previewOpenExtText}>Open in Device Viewer ↗</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.previewDoneBtn}
              activeOpacity={0.88}
              onPress={() => setPreviewModalVisible(false)}
            >
              <Text style={styles.previewDoneText}>Close Preview</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEE8D2',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FEE8D2',
    justifyContent: 'space-between',
  },
  bannerContainer: {
    width: width,
    height: width * (768 / 1024),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE8D2',
  },
  bannerImage: {
    width: width,
    height: '100%',
  },
  formContainer: {
    paddingHorizontal: 22,
    marginTop: -20,
    backgroundColor: '#FEE8D2',
  },
  headerBlock: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0B3542',
    letterSpacing: -0.4,
  },
  welcomeSubtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#685D56',
    marginTop: 4,
    lineHeight: 18,
  },

  // 4-Step Stepper
  stepperContainer: {
    backgroundColor: '#FFFDF9',
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#EFE5D6',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 20,
    shadowColor: '#3D2F14',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    width: 64,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3ECE3',
    borderWidth: 1.5,
    borderColor: '#D4C9BC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#0C4E3D',
    borderColor: '#0C4E3D',
  },
  stepCircleCompleted: {
    backgroundColor: '#0C4E3D',
    borderColor: '#0C4E3D',
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7D7166',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepCheckmark: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8A7D73',
    marginTop: 4,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#0B3542',
    fontWeight: '800',
  },
  stepLabelCompleted: {
    color: '#0C4E3D',
    fontWeight: '700',
  },
  stepActiveUnderline: {
    width: 22,
    height: 2,
    backgroundColor: '#0C4E3D',
    marginTop: 3,
    borderRadius: 1,
  },
  stepConnector: {
    flex: 1,
    height: 1.8,
    backgroundColor: '#E6DCCE',
    marginHorizontal: 2,
    marginBottom: 16,
  },
  stepConnectorActive: {
    backgroundColor: '#0C4E3D',
  },

  // Step Content
  stepContent: {
    width: '100%',
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B3542',
    marginBottom: 4,
  },
  sectionSubtext: {
    fontSize: 13,
    fontWeight: '500',
    color: '#685D56',
    lineHeight: 18,
    marginBottom: 12,
  },
  categoryBadgePill: {
    backgroundColor: '#F4ECE0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#0B3542',
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0B3542',
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  requiredStar: {
    color: '#C0392B',
  },
  optionalText: {
    fontSize: 11,
    color: '#8A7D73',
    fontWeight: '400',
  },

  // Inputs & Pills
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#FFFDF9',
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    borderRadius: 26,
    paddingHorizontal: 16,
    shadowColor: '#3D2F14',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  inputPillError: {
    borderColor: '#DC2626',
    backgroundColor: '#FFF5F5',
    borderWidth: 1.8,
  },
  fieldErrorText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#DC2626',
    marginTop: 4,
    marginLeft: 6,
  },
  fieldSuccessText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#059669',
    marginTop: 4,
    marginLeft: 6,
  },
  openPickerQuickBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#EAF6F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFE7D4',
  },
  openPickerQuickText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0C4E3D',
  },
  calendarInlineIconBtn: {
    padding: 6,
    marginLeft: 4,
  },
  dropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#FFFDF9',
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    borderRadius: 26,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    shadowColor: '#3D2F14',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  dropdownPillText: {
    flex: 1,
    fontSize: 14,
    color: '#0B3542',
    fontWeight: '600',
    marginLeft: 8,
  },
  dropdownPlaceholder: {
    color: '#A3968C',
    fontWeight: '400',
  },
  chevronIcon: {
    fontSize: 11,
    color: '#7A6E64',
    marginLeft: 6,
  },
  iconBox: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 16,
  },
  eyeIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#0B3542',
    fontWeight: '600',
    paddingVertical: 0,
    marginLeft: 8,
  },
  countryCodeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F3ECE3',
    borderRadius: 8,
    marginLeft: 6,
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B3542',
  },

  // Textarea
  textareaPill: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 82,
    backgroundColor: '#FFFDF9',
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#3D2F14',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  textareaInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0B3542',
    fontWeight: '500',
    textAlignVertical: 'top',
    marginLeft: 8,
    paddingTop: 2,
    minHeight: 64,
  },
  charCounter: {
    fontSize: 11,
    color: '#8A7D73',
    textAlign: 'right',
    marginTop: 4,
    marginRight: 6,
  },

  // Step 3 Verification Cards
  methodsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  methodCard: {
    flex: 1,
    backgroundColor: '#FFFDF9',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    padding: 14,
    shadowColor: '#3D2F14',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  methodCardSelected: {
    borderColor: '#0C4E3D',
    backgroundColor: '#F3FAF6',
    borderWidth: 2,
  },
  methodCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  methodIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3ECE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodEmoji: {
    fontSize: 18,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: '#C7BCB0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#0C4E3D',
    backgroundColor: '#0C4E3D',
  },
  radioCheckmark: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  methodTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0B3542',
    marginBottom: 2,
  },
  methodSubtitle: {
    fontSize: 11,
    color: '#685D56',
    lineHeight: 14,
  },

  // Upload Area
  uploadBox: {
    borderWidth: 1.8,
    borderStyle: 'dashed',
    borderColor: '#B8AFA5',
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBoxError: {
    borderColor: '#DC2626',
    backgroundColor: '#FFF5F5',
    borderStyle: 'solid',
  },
  uploadBoxDone: {
    borderColor: '#0C4E3D',
    backgroundColor: '#EAF6F0',
    borderStyle: 'solid',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3ECE3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadIconEmoji: {
    fontSize: 22,
  },
  uploadHeadline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B3542',
  },
  uploadSubtext: {
    fontSize: 11.5,
    color: '#7D7166',
    marginTop: 2,
  },
  uploadedFileName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0C4E3D',
  },
  uploadSuccessText: {
    fontSize: 11,
    color: '#0C4E3D',
    marginTop: 2,
    fontWeight: '600',
  },
  attachedCardContainer: {
    width: '100%',
  },
  uploadDoneIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#0C4E3D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadDoneCheckIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  docActionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  docActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  docActionBtnDanger: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  docActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  docActionTextDanger: {
    color: '#DC2626',
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  docPickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 24 : 32,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B3542',
    textAlign: 'center',
  },
  sheetSub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 16,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  sheetIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sheetEmoji: {
    fontSize: 20,
  },
  sheetOptionText: {
    flex: 1,
  },
  sheetOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B3542',
  },
  sheetOptionDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  sheetChevron: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '700',
  },
  sheetCancelBtn: {
    marginTop: 6,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  sheetCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 'auto',
    marginTop: 'auto',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  previewHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B3542',
  },
  previewHeaderSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  previewDocVisual: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewFileIcon: {
    marginBottom: 8,
  },
  previewDocName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B3542',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  previewBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
  },
  previewBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  previewMetaBox: {
    marginTop: 12,
    width: '90%',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 4,
  },
  previewMetaItem: {
    fontSize: 12,
    color: '#64748B',
  },
  previewImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewImageThumb: {
    width: '100%',
    height: '100%',
  },
  previewOpenExtBtn: {
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: '#EAF6F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  previewOpenExtText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  previewDoneBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0C4E3D',
    alignItems: 'center',
  },
  previewDoneText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Step 4 Membership Plan Card
  membershipCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#EFE5D6',
    padding: 18,
    marginBottom: 16,
    shadowColor: '#3D2F14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  planCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planCrownCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FEF6E4',
    borderWidth: 1,
    borderColor: '#EED6A5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  planCrownEmoji: {
    fontSize: 16,
  },
  planBadgeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B3542',
  },
  mostPopularPill: {
    backgroundColor: '#C88536',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mostPopularPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  planPriceBig: {
    fontSize: 38,
    fontWeight: '900',
    color: '#0C4E3D',
    letterSpacing: -0.5,
    marginRight: 8,
  },
  planPriceSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7A6B63',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F0E7D8',
    marginBottom: 14,
  },
  benefitsList: {
    gap: 9,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0C4E3D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  benefitCheckmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 13,
  },
  benefitText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },

  // Payment Methods
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentOptionCard: {
    flex: 1,
    backgroundColor: '#FFFDF9',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#3D2F14',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  paymentOptionSelected: {
    borderColor: '#0C4E3D',
    backgroundColor: '#F3FAF6',
    borderWidth: 2,
  },
  paymentCheckCircle: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0C4E3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentCheckIcon: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  paymentOptionEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  paymentOptionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0B3542',
    textAlign: 'center',
  },

  // Terms Checkbox
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  termsCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.8,
    borderColor: '#A3968C',
    backgroundColor: '#FFFDF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  termsCheckboxChecked: {
    backgroundColor: '#0C4E3D',
    borderColor: '#0C4E3D',
  },
  termsCheckmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  termsText: {
    fontSize: 12,
    color: '#5C4D44',
    flex: 1,
  },
  termsLink: {
    color: '#0C4E3D',
    fontWeight: '700',
  },

  // Action Buttons
  primaryButton: {
    height: 52,
    backgroundColor: '#0C4E3D',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0C4E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    width: 96,
    height: 52,
    backgroundColor: '#FFFDF9',
    borderWidth: 1.5,
    borderColor: '#0C4E3D',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  secondaryButtonText: {
    color: '#0C4E3D',
    fontSize: 14.5,
    fontWeight: '700',
  },
  dualButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  loginRedirectRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 6,
  },
  loginRedirectText: {
    fontSize: 13.5,
    color: '#5C4D44',
    fontWeight: '500',
  },
  loginRedirectLink: {
    fontSize: 13.5,
    color: '#C88536',
    fontWeight: '800',
  },

  // Bottom Wave
  bottomWaveContainer: {
    width: width,
    height: 52,
    marginTop: 16,
  },
  bottomWaveImage: {
    width: '100%',
    height: '100%',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 53, 66, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFDF9',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E7D8',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B3542',
  },
  modalSubtitle: {
    fontSize: 11.5,
    color: '#7D7166',
    marginTop: 2,
    fontWeight: '500',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#7D7166',
    fontWeight: '700',
  },
  pickerOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F6EFE5',
  },
  pickerOptionText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0B3542',
    flex: 1,
  },
  pickerOptionArrow: {
    fontSize: 15,
    color: '#0C4E3D',
    fontWeight: '700',
  },

  // Interactive Date Picker Modal Columns & Styles
  datePickerColumnsRow: {
    flexDirection: 'row',
    gap: 10,
    height: 190,
    marginVertical: 10,
  },
  datePickerColumn: {
    flex: 1,
    backgroundColor: '#F8F4EE',
    borderRadius: 14,
    padding: 6,
    borderWidth: 1,
    borderColor: '#EDE3D5',
  },
  dateColumnHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B3542',
    textAlign: 'center',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E6DCCE',
    marginBottom: 4,
  },
  dateColumnScroll: {
    flex: 1,
  },
  datePillItem: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  datePillItemActive: {
    backgroundColor: '#0C4E3D',
  },
  datePillText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#4B3F35',
  },
  datePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  ageIndicatorCard: {
    backgroundColor: '#EAF6F0',
    borderRadius: 14,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#BFE7D4',
    alignItems: 'center',
  },
  ageIndicatorText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0B3542',
  },
  ageEligibilityText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0C4E3D',
    marginTop: 3,
  },

  // Success Modal
  successModalCard: {
    backgroundColor: '#FFFDF9',
    marginHorizontal: 20,
    marginVertical: 'auto',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0B3542',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  successShield: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0C4E3D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#0C4E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successCheckmark: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0B3542',
    textAlign: 'center',
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 13,
    color: '#685D56',
    textAlign: 'center',
    marginBottom: 16,
  },
  trackingBox: {
    width: '100%',
    backgroundColor: '#F8F4EE',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE5D6',
    padding: 14,
    gap: 8,
    marginBottom: 14,
  },
  trackingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7D7166',
  },
  trackingValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0B3542',
    maxWidth: '60%',
    textAlign: 'right',
  },
  verificationDeskNotice: {
    fontSize: 11.5,
    color: '#685D56',
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
