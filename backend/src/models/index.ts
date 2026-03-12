import SupplierModelClass, { initSupplierModel } from "./supplier.model.js";
import ProductModelClass, { initProductModel } from "./product.model.js";
import ComponentModelClass, { initComponentModel } from "./component.model.js";
import ComplianceRecordModelClass, {
  initComplianceRecordModel,
} from "./complianceRecord.model.js";
import RiskAlertModelClass, { initRiskAlertModel } from "./riskAlert.model.js";

import VerificationLogModelClass, {
  initVerificationLogModel,
} from "./verificationLog.model.js";
import UserModelClass, { initUserModel } from "./user.model.js";
import { sequelize } from "../config/db.js";

// Export actual Sequelize model types (NOT nullable)
export let Supplier = SupplierModelClass as typeof SupplierModelClass;
export let Product = ProductModelClass as typeof ProductModelClass;
export let Component = ComponentModelClass as typeof ComponentModelClass;
export let ComplianceRecord =
  ComplianceRecordModelClass as typeof ComplianceRecordModelClass;
export let RiskAlert = RiskAlertModelClass as typeof RiskAlertModelClass;
export let VerificationLog =
  VerificationLogModelClass as typeof VerificationLogModelClass;
export let User = UserModelClass as typeof UserModelClass;

let initialized = false;

export function initModels() {
  if (initialized)
    return {
      Supplier,
      Product,
      Component,
      ComplianceRecord,
      RiskAlert,
      VerificationLog,
      User,
    };

  // Initialize models using shared sequelize instance
  Supplier = initSupplierModel(sequelize);
  Product = initProductModel(sequelize);
  Component = initComponentModel(sequelize);
  ComplianceRecord = initComplianceRecordModel(sequelize);
  RiskAlert = initRiskAlertModel(sequelize);
  VerificationLog = initVerificationLogModel(sequelize);
  User = initUserModel(sequelize);

  const models = {
    Supplier,
    Product,
    Component,
    ComplianceRecord,
    RiskAlert,
    VerificationLog,
    User,
  };

  // Setup associations if needed
  if (typeof Supplier.associate === "function") Supplier.associate(models);
  if (typeof Product.associate === "function") Product.associate(models);
  if (typeof Component.associate === "function") Component.associate(models);
  if (typeof ComplianceRecord.associate === "function")
    ComplianceRecord.associate(models);
  if (typeof RiskAlert.associate === "function") RiskAlert.associate(models);

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
  VerificationLogModelClass as VerificationLogModel,
  UserModelClass as UserModel,
};
