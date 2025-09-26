"use client";
import { useRouter } from "next/navigation";
import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Separator } from "@repo/ui/components/ui/separator";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Building2, MapPin, Globe2, Users, Briefcase, GraduationCap, Wrench, Layers, Compass, History, Mail, Phone, Hash, Building, AlertCircle, User, LucideIcon } from "lucide-react";
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";

// Define session type with accessToken
interface CustomSession {
    accessToken?: string;
    [key: string]: any;
}

// Add utility function for organization code transformation
const transformOrganizationCode = (code: string) => {
    return code
        .replace(/([A-Z])/g, '-$1') // Add hyphen before capital letters
        .toLowerCase() // Convert to lowercase
        .replace(/^-/, ''); // Remove leading hyphen if exists
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

interface InfoItemProps {
    label: string;
    value: string | number | null;
    icon?: LucideIcon;
}

interface InfoCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    children: ReactNode;
    className?: string;
}

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-8 p-4">
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-1/4" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
    {Icon && <Icon className="h-5 w-5 text-muted-foreground mt-1" />}
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base font-semibold">{value || 'N/A'}</p>
    </div>
  </div>
);

const InfoCard: React.FC<InfoCardProps> = ({ title, description, icon: Icon, children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <CardHeader className="flex flex-row items-center gap-4 pb-2 border-b bg-muted/50">
        <Icon className="h-6 w-6 text-primary" />
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  </motion.div>
);

function OrganizationSummaryCards({ org }: { org: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {/* Logo and Name */}
      <div className="relative bg-white rounded-2xl shadow-md p-6 flex flex-col gap-2 min-w-[180px] border border-gray-100 items-center">
        <img
          src={org.logoFileName ? `/uploads/${org.logoFileName}` : "/default-logo.png"}
          alt={org.organizationName}
          className="w-14 h-14 rounded-full object-cover shadow-lg mb-2 border-2 border-blue-100"
        />
        <div className="text-lg font-bold text-gray-900 text-center">{org.organizationName}</div>
        <div className="text-xs text-gray-500 text-center">{org.description}</div>
        <span className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${org.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {org.status ? org.status.charAt(0).toUpperCase() + org.status.slice(1) : 'Inactive'}
        </span>
      </div>
      {/* Code and Location */}
      <div className="relative bg-white rounded-2xl shadow-md p-6 flex flex-col gap-2 min-w-[180px] border border-gray-100">
        <div className="flex items-center gap-2 text-gray-700">
          <Hash size={18} /> <span className="font-semibold">Code:</span> {org.organizationCode}
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin size={18} /> <span className="font-semibold">City:</span> {org.city}
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin size={18} /> <span className="font-semibold">PIN:</span> {org.pincode}
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin size={18} /> <span className="font-semibold">Address 1:</span> {org.addressLine1 || '-'}
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin size={18} /> <span className="font-semibold">Address 2:</span> {org.addressLine2 || '-'}
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Globe2 size={18} /> <span className="font-semibold">Country:</span> {Array.isArray(org.country) ? org.country.join(', ') : org.country || '-'}
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Building2 size={18} /> <span className="font-semibold">State:</span> {Array.isArray(org.state) ? org.state.join(', ') : org.state || '-'}
        </div>
      </div>
      {/* Contact and Registration */}
      <div className="relative bg-white rounded-2xl shadow-md p-6 flex flex-col gap-2 min-w-[180px] border border-gray-100">
        <div className="flex items-center gap-2 text-gray-700">
          <Mail size={18} /> <span className="font-semibold">Email:</span> {org.email}
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Phone size={18} /> <span className="font-semibold">Contact:</span> {org.contactNumber}
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Hash size={18} /> <span className="font-semibold">Tenant:</span> {org.tenantCode}
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <User size={18} /> <span className="font-semibold">Reg. No:</span> {org.registrationNumber}
        </div>
      </div>
      {/* Description (or more details) */}
      <div className="relative bg-white rounded-2xl shadow-md p-6 flex flex-col gap-2 min-w-[180px] border border-gray-100">
        <div className="text-xs text-gray-500 mb-2 font-semibold">About</div>
        <div className="text-sm text-gray-700">{org.description}</div>
      </div>
    </div>
  );
}

export default function OrganizationPage() {
    const { data: organizationData, loading, error } = useRequest<any[]>({
        url: "organization",
        onSuccess: (data) => {
            if (data?.[0]?.organizationCode) {
                data[0].organizationCode = transformOrganizationCode(data[0].organizationCode);
            }
        },
        onError: (error) => {
            console.error('Error loading organization data:', error);
        }
    });

    if (loading) return <LoadingSkeleton />;
    
    if (error) return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[400px] text-destructive space-y-4"
        >
            <div className="p-4 bg-destructive/10 rounded-full">
                <AlertCircle className="h-8 w-8" />
            </div>
            <p className="text-lg font-medium">Error loading organization data</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
        </motion.div>
    );
    
    if (!organizationData?.[0]) return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground space-y-4"
        >
            <div className="p-4 bg-muted rounded-full">
                <Building2 className="h-8 w-8" />
            </div>
            <p className="text-lg font-medium">No organization data found</p>
            <p className="text-sm">Please check your connection and try again</p>
        </motion.div>
    );

    const org = organizationData[0];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-background p-6 space-y-8"
        >
            {/* Organization Summary Cards Row */}
            <OrganizationSummaryCards org={org} />
            {/* Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-card rounded-lg shadow-sm"
            >
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">{org.organizationName}</h1>
                    <p className="text-muted-foreground max-w-2xl">{org.description}</p>
                </div>
                <Badge 
                    variant={org.isActive ? "default" : "destructive"} 
                    className="text-sm px-4 py-1.5 self-start md:self-center"
                >
                    {org.isActive ? "Active" : "Inactive"}
                </Badge>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Information */}
                <InfoCard 
                    title="Organization Details" 
                    description="Core information about the organization"
                    icon={Building2}
                    className="col-span-1 md:col-span-2"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InfoItem 
                            label="Organization Code" 
                            value={org.organizationCode}
                            icon={Hash}
                        />
                        <InfoItem 
                            label="Registration Number" 
                            value={org.registrationNo}
                            icon={Building}
                        />
                        <InfoItem 
                            label="Email" 
                            value={org.emailId}
                            icon={Mail}
                        />
                        <InfoItem 
                            label="Contact Number" 
                            value={org.contactPersonContactNumber}
                            icon={Phone}
                        />
                        <InfoItem 
                            label="Tenant Code" 
                            value={org.tenantCode}
                            icon={Hash}
                        />
                    </div>
                </InfoCard>

                {/* Address Information */}
                <InfoCard 
                    title="Address Information" 
                    description="Location details"
                    icon={MapPin}
                >
                    <div className="space-y-4">
                        <InfoItem 
                            label="City" 
                            value={org.city}
                            icon={MapPin}
                        />
                        <InfoItem 
                            label="PIN Code" 
                            value={org.pinCode}
                            icon={MapPin}
                        />
                    </div>
                </InfoCard>

                {/* Countries */}
                <InfoCard 
                    title="Countries" 
                    description="Operating countries"
                    icon={Globe2}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {org.country.map((country: any) => (
                            <div 
                                key={country.countryCode} 
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <span className="font-medium">{country.countryName}</span>
                                <Badge variant="outline" className="ml-2">{country.countryCode}</Badge>
                            </div>
                        ))}
                    </div>
                </InfoCard>

                {/* States */}
                <InfoCard 
                    title="States" 
                    description="Operating states and regions"
                    icon={MapPin}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {org.state.map((state: any) => (
                            <div 
                                key={state.stateCode} 
                                className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors space-y-1"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{state.stateName}</span>
                                    <Badge variant="outline">{state.stateCode}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{state.region}</p>
                            </div>
                        ))}
                    </div>
                </InfoCard>

                {/* Designations */}
                <InfoCard 
                    title="Designations" 
                    description="Employee roles and positions"
                    icon={Briefcase}
                >
                    <div className="grid grid-cols-1 gap-3">
                        {org.designations.map((designation: any) => (
                            <div 
                                key={designation.designationCode} 
                                className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">{designation.designationName}</h3>
                                    <div className="flex gap-2">
                                        <Badge variant="outline">{designation.designationCode}</Badge>
                                        <Badge variant="outline">{designation.divisionCode}</Badge>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{designation.designationDescription}</p>
                            </div>
                        ))}
                    </div>
                </InfoCard>

                {/* Employee Categories */}
                <InfoCard 
                    title="Employee Categories" 
                    description="Employee classification"
                    icon={Users}
                >
                    <div className="grid grid-cols-1 gap-3">
                        {org.employeeCategories.map((category: any) => (
                            <div 
                                key={category.employeeCategoryCode} 
                                className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">{category.employeeCategoryName}</h3>
                                    <Badge variant="outline">{category.employeeCategoryCode}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{category.employeeCategoryDescription}</p>
                            </div>
                        ))}
                    </div>
                </InfoCard>

                {/* Skill Levels */}
                <InfoCard 
                    title="Skill Levels" 
                    description="Employee skill classifications"
                    icon={GraduationCap}
                >
                    <div className="grid grid-cols-1 gap-3">
                        {org.skillLevels.map((skill: any, index: number) => (
                            <div 
                                key={index} 
                                className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors space-y-2"
                            >
                                <h3 className="font-semibold">{skill.skilledLevelTitle}</h3>
                                <p className="text-sm text-muted-foreground">{skill.skilledLevelDescription}</p>
                            </div>
                        ))}
                    </div>
                </InfoCard>

                {/* Work Skills */}
                <InfoCard 
                    title="Work Skills" 
                    description="Available work skills"
                    icon={Wrench}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {org.workSkill.map((skill: any) => (
                            <div 
                                key={skill.workSkillCode} 
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <span className="font-medium">{skill.workSkillTitle}</span>
                                <Badge variant="outline">{skill.workSkillCode}</Badge>
                            </div>
                        ))}
                    </div>
                </InfoCard>

                {/* Nature of Work */}
                <InfoCard 
                    title="Nature of Work" 
                    description="Types of work categories"
                    icon={Layers}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {org.natureOfWork.map((work: any) => (
                            <div 
                                key={work.natureOfWorkCode} 
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <span className="font-medium">{work.natureOfWorkTitle}</span>
                                <Badge variant="outline">{work.natureOfWorkCode}</Badge>
                            </div>
                        ))}
                    </div>
                </InfoCard>

                {/* Regions */}
                <InfoCard 
                    title="Regions" 
                    description="Geographical regions"
                    icon={Compass}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {org.region.map((region: any) => (
                            <div 
                                key={region.regionCode} 
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <span className="font-medium">{region.regionName}</span>
                                <Badge variant="outline">{region.regionCode}</Badge>
                            </div>
                        ))}
                    </div>
                </InfoCard>

                {/* Audit Trail */}
                <InfoCard 
                    title="Audit Information" 
                    description="Record of changes and updates"
                    icon={History}
                    className="col-span-1 md:col-span-2"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors space-y-2">
                            <h3 className="font-semibold flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Created By
                            </h3>
                            <p className="text-lg">{org.auditTrail.createdBy}</p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(org.auditTrail.createdOn).toLocaleString()}
                            </p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors space-y-2">
                            <h3 className="font-semibold flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Last Updated By
                            </h3>
                            <p className="text-lg">{org.auditTrail.updatedBy}</p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(org.auditTrail.updatedOn).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </InfoCard>
            </div>
        </motion.div>
    );
}
