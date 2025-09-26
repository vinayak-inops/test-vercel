import { VscOrganization } from "react-icons/vsc";
import { LuFileUser } from "react-icons/lu";
import { MdOutlinePolicy } from "react-icons/md";
import { LuSquareUserRound } from "react-icons/lu";
import { MdOutlineCastForEducation } from "react-icons/md";
import { MdOutlineMiscellaneousServices } from "react-icons/md";
import { MdModelTraining } from "react-icons/md";
import { IoDocumentsOutline } from "react-icons/io5";
import { RiFileExcel2Line } from "react-icons/ri";
import { 
    Building2, 
    MapPin, 
    GitBranch, 
    Split, 
    BadgeInfo, 
    Layers, 
    ListOrdered, 
    Rows, 
    Star, 
    Users, 
    Wrench, 
    ClipboardList,
    Briefcase,
    GraduationCap,
    ClipboardCheck,
    ClipboardType,
    Timer,
    Clock,
    CalendarClock,
    FileCheck,
    ScrollText,
    FileText,
    Package,
    DollarSign,
    Hash,
    Tag,
    Trophy,
    Award,
    ShieldCheck
} from "lucide-react";
import { organization } from "../organization/form-structure";
import { location } from "../organization/location/form-structure";
import { subsidiary } from "../organization/subsidiary/form-structure";

export const navigation = [
  {
    title: "MASTER",
    items: [
      {
        title: "Organization",
        icon: <VscOrganization className="w-5 h-5" />,
        href: "/organization",
        from: organization
      },
      {
        title: "Contractor Employee",
        icon: <LuFileUser className="w-5 h-5" />,
        href: "/contractor-employee",
        from: organization
      },
      {
        title: "Policy",
        icon: <MdOutlinePolicy className="w-5 h-5" />,
        href: "/policy",
        from: subsidiary
      },
      {
        title: "User",
        icon: <LuSquareUserRound className="w-5 h-5" />,
        href: "/user",
        from: organization
      },
      {
        title: "Education",
        icon: <MdOutlineCastForEducation className="w-5 h-5" />,
        href: "/education",
        from: organization
      },
      {
        title: "Miscellaneous",
        icon: <MdOutlineMiscellaneousServices className="w-5 h-5" />,
        href: "/miscellaneous",
        from: organization
      },
      {
        title: "Training",
        icon: <MdModelTraining className="w-5 h-5" />,
        href: "/training",
        from: organization
      },
      {
        title: "Document",
        icon: <IoDocumentsOutline className="w-5 h-5" />,
        href: "/document",
        from: organization
      },
    ],
  },
  {
    title: "DATA MANAGEMENT",
    items: [
      {
        title: "Excel Upload",
        icon: <RiFileExcel2Line className="w-5 h-5" />,
        href: "/excel-file-manager",
        badge: "NEW",
        from: null
      },
      // { title: "Import Data", icon: "FileUpload", href: "/import" },
      // { title: "Bulk Upload", icon: "CloudUpload", href: "/bulk-upload" },
    ],
  },
];


export const navItemsForm = [
  {
    label: "Organization",
    link: "/organization",
    dropdown: "Organization",
    items: [
      {
        icon: "Building2", label: "Organization",
        link: "/organization"
      },
      {
        icon: "MapPin", label: "Location",
        link: "/organization/location"
      },
      {
        icon: "GitBranch", label: "Subsidiaries",
        link: "/organization/subsidiaries"
      },
      {
        icon: "Split", label: "Divisions",
        link: "/organization/divisions"
      },
      {
        icon: "BadgeInfo", label: "Designations",
        link: "/organization/designations"
      },
      {
        icon: "Layers", label: "Departments",
        link: "/organization/departments"
      },
      {
        icon: "ListOrdered", label: "Sub Departments",
        link: "/organization/sub-departments"
      },
      {
        icon: "Rows", label: "Sections",
        link: "/organization/sections"
      },
      {
        icon: "Star", label: "Grades",
        link: "/organization/grades"
      },
      {
        icon: "Users", label: "Category",
        link: "/organization/employee-categories"
      },
      {
        icon: "Wrench", label: "Work Skill",
        link: "/organization/work-Skill"
      },
      {
        icon: "ClipboardType", label: "Nature Of Work",
        link: "/organization/nature-of-work"
      },
      {
        icon: "Briefcase", label: "Asset Master",
        link: "/organization/asset-master"
      },
      {
        icon: "DollarSign", label: "Wage Period",
        link: "/organization/wage-period"
      },
      {
        icon: "FileText", label: "Document Master",
        link: "/organization/document-master"
      },
      { icon: "Star", label: "Skill Level",
        link: "/organization/skill-levels"
      },
      {
        icon: "Tag", label: "Reason Code",
        link: "/organization/reason-codes"
      },
      {
        icon: "Map", label: "Region",
        link: "/organization/region"
      },
      {
        icon: "Map", label: "Country",
        link: "/organization/country"
      },
      {
        icon: "Map", label: "State",
        link: "/organization/state"
      },
    ]
  },
  {
    label: "Contractor Employee",
    link: "/contractor-employee",
    dropdown: "Contractor Employee",
    items: [
      {
        icon: "UserCog", label: "Contractor Employee",
        link: "/contractor-employee"
      },
      {
        icon: "User", label: "Contractor",
        link: "/contractor"
      },
      {
        icon: "Users", label: "Company Employee",
        link: "/company-employee"
      },
      // {
      //   icon: "Tag", label: "Category",
      //   link: "/contractor-employee/category"
      // },
      // {
      //   icon: "Briefcase", label: "Assign Role",
      //   link: "/contractor-employee/assign-role"
      // },
      // {
      //   icon: "Star", label: "Grade",
      //   link: "/contractor-employee/grade"
      // },
      // {
      //   icon: "BadgeInfo", label: "Designation",
      //   link: "/contractor-employee/designation"
      // },
      // {
      //   icon: "CalendarCheck2", label: "Week Off Allocation",
      //   link: "/contractor-employee/week-off-allocation"
      // },
      {
        icon: "Repeat2", label: "Employee Shift",
        link: "/employee-shift"
      },
      // {
      //   icon: "Map", label: "Area Of Work",
      //   link: "/contractor-employee/area-of-work"
      // },
      // {
      //   icon: "Wrench", label: "Work Skill",
      //   link: "/contractor-employee/work-skill"
      // },
      // {
      //   icon: "ClipboardList", label: "Nature Of Work",
      //   link: "/contractor-employee/nature-of-work"
      // },
      // {
      //   icon: "Layers", label: "Salary Allocation Bulk",
      //   link: "/contractor-employee/salary-allocation-bulk"
      // },
      // {
      //   icon: "FileText", label: "Salary Process",
      //   link: "/contractor-employee/salary-process"
      // },
      // {
      //   icon: "CheckCircle2", label: "Manual Attendance",
      //   link: "/contractor-employee/manual-attendance"
      // },
      // {
      //   icon: "Upload", label: "Mass Contractor Employee Upload",
      //   link: "/contractor-employee/mass-contractor-employee-upload"
      // },
      // {
      //   icon: "CalendarClock", label: "Assign Auto Shift",
      //   link: "/contractor-employee/assign-auto-shift"
      // },
      // {
      //   icon: "CheckCircle2", label: "Attendance Approval",
      //   link: "/contractor-employee/attendance-approval"
      // },
      // {
      //   icon: "Clock", label: "Over Time Rate Detail",
      //   link: "/contractor-employee/over-time-rate-detail"
      // }
    ]
  },
  {
    label: "Policy",
    dropdown: "Policy",
    items: [
      {
        icon: "CalendarCheck2", label: "Holiday",
        link: "/policy/holiday"
      },
      // {
      //   icon: "Calendar", label: "Week Off Default",
      //   link: "/policy/week-off-default"
      // },
      // {
      //   icon: "Repeat2", label: "Shift",
      //   link: "/policy/shift"
      // },
      {
        icon: "ScrollText", label: "Shift Policy",
        link: "/shift/shift-list"
      },
      // {
      //   icon: "Map", label: "Shift Scope",
      //   link: "/policy/shift-scope"
      // },
      // {
      //   icon: "Repeat2", label: "Shift Rotation Pattern",
      //   link: "/policy/shift-rotation-pattern"
      // },
      {
        icon: "Clock", label: "Over Time",
        link: "/policy/over-time"
      },
      // {
      //   icon: "Tag", label: "Leave Code",
      //   link: "/policy/leave-code"
      // },
      {
        icon: "FileText", label: "Leave Policy",
        link: "/leave-policy"
      },
      // {
      //   icon: "Star", label: "Leave Balance Adjustment",
      //   link: "/policy/leave-balance-adjustment"
      // },
      {
        icon: "BadgeInfo", label: "Compensatory off policy",
        link: "/policy/compensatory-off-policy"
      },
      // {
      //   icon: "Layers", label: "Week Off and Shift Template",
      //   link: "/policy/week-off-and-shift-template"
      // }
    ]
  },
  // {
  //   label: "Salary",
  //   dropdown: "Salary",
  //   items: [
  //     {
  //       icon: "DollarSign", label: "Salary Head",
  //       link: "/salary/salary-head"
  //     },
  //     {
  //       icon: "FileText", label: "Salary Template",
  //       link: "/salary/salary-template"
  //     },
  //     {
  //       icon: "Percent", label: "Professional Tax",
  //       link: "/salary/professional-tax"
  //     },
  //     {
  //       icon: "BadgeInfo", label: "Minimum Wages",
  //       link: "/salary/minimum-wages"
  //     },
  //     {
  //       icon: "ListOrdered", label: "Salary Head Sequence",
  //       link: "/salary/salary-head-sequence"
  //     },
  //   ]
  // }
];

export const navItemsExcel = [
  {
    label: "Excel Upload",
    link: "/excel-file-manager",
  }
];
