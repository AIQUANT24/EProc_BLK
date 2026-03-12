
package main

type ProductCompliance struct {
	SupplierID       string  `json:"supplierId"`
	ProductID        string  `json:"productId"`
	BOMHash          string  `json:"bomHash"`
	DVA              float64 `json:"dva"` // Domestic Value Addition %
	VerificationLogs string  `json:"verificationLogs"` // Will be "pending" or "approved"
	Timestamp        string  `json:"timestamp"`
}