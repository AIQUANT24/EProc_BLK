package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type ComplianceContract struct {
	contractapi.Contract
}



func (c *ComplianceContract) CreateProductRecord(
	ctx contractapi.TransactionContextInterface,
	supplierId string,
	productId string,
	bomHash string,
	dva float64,
) error {

	key := productId

	exists, err := ctx.GetStub().GetState(key)
	if err != nil {
		return err
	}

	if exists != nil {
		return fmt.Errorf("product record already exists")
	}

	record := ProductCompliance{
		SupplierID:       supplierId,
		ProductID:        productId,
		BOMHash:          bomHash,
		DVA:              dva,
		VerificationLogs: "pending", 
		Timestamp:        time.Now().Format(time.RFC3339),
	}

	recordBytes, err := json.Marshal(record)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(key, recordBytes)
}


func (c *ComplianceContract) ApproveVerification(
	ctx contractapi.TransactionContextInterface,
	productId string,
) error {

	key := productId

	recordBytes, err := ctx.GetStub().GetState(key)
	if err != nil {
		return err
	}

	if recordBytes == nil {
		return fmt.Errorf("product record not found")
	}

	var record ProductCompliance

	err = json.Unmarshal(recordBytes, &record)
	if err != nil {
		return err
	}

	// Check if already approved
	if record.VerificationLogs == "approved" {
		return fmt.Errorf("product %s is already approved", productId)
	}

	// Update verification status to approved
	record.VerificationLogs = "approved"
	record.Timestamp = time.Now().Format(time.RFC3339) // Update timestamp

	updatedBytes, err := json.Marshal(record)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(key, updatedBytes)
}


func (c *ComplianceContract) GetProductRecord(
	ctx contractapi.TransactionContextInterface,
	productId string,
) (*ProductCompliance, error) {

	key := productId

	recordBytes, err := ctx.GetStub().GetState(key)
	if err != nil {
		return nil, err
	}

	if recordBytes == nil {
		return nil, fmt.Errorf("record not found")
	}

	var record ProductCompliance

	err = json.Unmarshal(recordBytes, &record)
	if err != nil {
		return nil, err
	}

	return &record, nil
}


func (c *ComplianceContract) GetVerificationStatus(
	ctx contractapi.TransactionContextInterface,
	productId string,
) (string, error) {

	key := productId

	recordBytes, err := ctx.GetStub().GetState(key)
	if err != nil {
		return "", err
	}

	if recordBytes == nil {
		return "", fmt.Errorf("record not found")
	}

	var record ProductCompliance

	err = json.Unmarshal(recordBytes, &record)
	if err != nil {
		return "", err
	}

	return record.VerificationLogs, nil
}