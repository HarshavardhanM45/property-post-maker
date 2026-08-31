import { Building2, MapPin, IndianRupee, Sparkles } from 'lucide-react';

function PropertyForm({ formData, setFormData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fields = [
    {
      name: 'propertyType',
      label: 'Property & Type',
      placeholder: 'e.g. 4 BHK Luxury Villa',
      icon: <Building2 className="w-5 h-5 text-slate-400" />
    },
    {
      name: 'location',
      label: 'Location',
      placeholder: 'e.g. Sushant Golf City, Lucknow',
      icon: <MapPin className="w-5 h-5 text-slate-400" />
    },
    {
      name: 'price',
      label: 'Price',
      placeholder: 'e.g. ₹2.5 Cr onwards',
      icon: <IndianRupee className="w-5 h-5 text-slate-400" />
    },
    {
      name: 'highlights',
      label: 'Highlights',
      placeholder: 'e.g. 3000 sq.ft · Corner plot · Ready to move',
      icon: <Sparkles className="w-5 h-5 text-slate-400" />
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {fields.map(field => (
        <div key={field.name} className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700 ml-1">
            {field.label}
          </label>
          <div className="relative flex items-center group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-slate-900">
              {field.icon}
            </div>
            <input
              type="text"
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all sm:text-sm font-medium"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default PropertyForm;
