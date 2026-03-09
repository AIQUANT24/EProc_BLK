interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const PageHeader = ({ title, description, actions }: PageHeaderProps) => (
  <div className="mb-8 flex items-start justify-between">
    <div>
      <h1 className="text-2xl font-bold font-display lg:text-3xl">{title}</h1>
      {description && <p className="mt-1 text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);

export default PageHeader;
