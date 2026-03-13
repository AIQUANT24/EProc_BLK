import SupplierModelClass, { initSupplierModel } from "./supplier.model.js";
import ProductModelClass, { initProductModel } from "./product.model.js";
import ComponentModelClass, { initComponentModel } from "./component.model.js";
import ComplianceRecordModelClass, {
  initComplianceRecordModel,
} from "./complianceRecord.model.js";
import RiskAlertModelClass, { initRiskAlertModel } from "./riskAlert.model.js";
import FileModelClass, { initFileModel } from "./files.model.js";

import UserModelClass, { initUserModel } from "./user.model.js";
import AuditModelClass, { initAuditModel } from "./audit.model.js";
import { sequelize } from "../config/db.js";

// Export actual Sequelize model types (NOT nullable)
export let Supplier = SupplierModelClass as typeof SupplierModelClass;
export let Product = ProductModelClass as typeof ProductModelClass;
export let Component = ComponentModelClass as typeof ComponentModelClass;
export let ComplianceRecord =
  ComplianceRecordModelClass as typeof ComplianceRecordModelClass;
export let RiskAlert = RiskAlertModelClass as typeof RiskAlertModelClass;

export let User = UserModelClass as typeof UserModelClass;
export let File = FileModelClass as typeof FileModelClass;

export let AuditLog = AuditModelClass as typeof AuditModelClass;

let initialized = false;

export function initModels() {
  if (initialized)
    return {
      Supplier,
      Product,
      Component,
      ComplianceRecord,
      RiskAlert,
      User,
      File,
      AuditLog,
    };

  // Initialize models using shared sequelize instance
  Supplier = initSupplierModel(sequelize);
  Product = initProductModel(sequelize);
  Component = initComponentModel(sequelize);
  ComplianceRecord = initComplianceRecordModel(sequelize);
  RiskAlert = initRiskAlertModel(sequelize);
  User = initUserModel(sequelize);
  File = initFileModel(sequelize);
  AuditLog = initAuditModel(sequelize);

  const models = {
    Supplier,
    Product,
    Component,
    ComplianceRecord,
    RiskAlert,
    User,
    File,
    AuditLog,
  };

  // OPTIMIZATION: Loop through all models to run associations automatically.
  // This guarantees you never forget to associate a new model like File or User!
  Object.values(models).forEach((model: any) => {
    if (typeof model.associate === "function") {
      model.associate(models);
    }
  });

  initialized = true;

  return models;
}

// Backward compatibility exports
export {
  SupplierModelClass as SupplierModel,
  ProductModelClass as ProductModel,
  ComponentModelClass as ComponentModel,
  ComplianceRecordModelClass as ComplianceRecordModel,
  RiskAlertModelClass as RiskAlertModel,
  UserModelClass as UserModel,
  FileModelClass as FileModel,
  AuditModelClass as AuditLogModel,
};
