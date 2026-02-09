import { Typography } from "antd";
import dayjs from "dayjs";
import React from "react";
const { Title } = Typography;

const PrintableReceiptPage = ({ bill, apartmentData, copyTitle }) => {
    console.log(`⩇⩇:⩇⩇🚨 ~ bill :`, bill);


    const apartmentInfo = {
        name: apartmentData?.result?.apartmentName,
        address: apartmentData?.result?.addressLine,
        phones: apartmentData?.result?.phones,
        logo:
            apartmentData?.result?.logo ||
            "https://placehold.co/80x40/6366f1/ffffff?text=Logo",
    };

    const monthYearDisplay = `${bill.billingPeriod.month} ${dayjs()
        .year(bill.billingPeriod.year)
        .add(543, "year")
        .format("BBBB")}`;

    return (
        <div>
            {/* --- Global CSS for print page --- */}
            <style>{`
        @page {
          size: A4;
          margin: 10mm;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print-page {
             page-break-inside: avoid; 
             page-break-after: auto;
          }
        }

        .receipt-container {
          font-family: 'Sarabun', sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: #333;
          display: flex;
          flex-direction: column;
          min-height: 100%;
        }

        .receipt-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 0.5rem;
        }

        .receipt-table th, .receipt-table td {
          border: 1px solid #ddd;
          padding: 6px;
          font-size: 12px;
        }

        .receipt-table th {
          background: #eef2ff;
          font-weight: bold;
        }

        .text-right { text-align: right; }
        .text-center { text-align: center; }
      `}</style>

            <div className="print-page">
                <div className="receipt-container">
                    {copyTitle && (
                        <h4
                            style={{
                                textAlign: "center",
                                fontWeight: "bold",
                                margin: "0 0 1rem 0",
                                color: "#4338ca",
                            }}
                        >
                            {copyTitle}
                        </h4>
                    )}

                    {/* Header */}
                    <table style={{ width: "100%", marginBottom: "0.5rem" }}>
                        <tbody>
                            <tr>
                                <td style={{ width: "60%" }}>
                                    <img
                                        src={apartmentInfo.logo}
                                        alt="logo"
                                        style={{
                                            width: "70px",
                                            marginBottom: "5px",
                                            borderRadius: "4px",
                                        }}
                                    />
                                    <br />
                                    <strong style={{ fontSize: "14px", color: "#4f46e5" }}>
                                        {apartmentInfo.name}
                                    </strong>
                                    <br />
                                    {apartmentInfo?.phones?.map((item, index) => (
                                        <span key={item._id || index} style={{ fontSize: "11px" }}>
                                            {item.type === "mobile" ? "มือถือ" : "สำนักงาน"}:{" "}
                                            {item.number}{" "}
                                        </span>
                                    ))}
                                    <br />
                                    <span style={{ fontSize: "11px" }}>{apartmentInfo.address}</span>
                                </td>
                                {/* <td style={{ verticalAlign: "top", textAlign: "right" }}>
                                    <h3
                                        style={{
                                            margin: "0",
                                            fontWeight: "bold",
                                            color: "#4f46e5",
                                        }}
                                    >
                                        {bill.tenantInfo.roomNumber}
                                    </h3>
                                </td> */}
                            </tr>
                        </tbody>
                    </table>

                    {/* Title */}
                    <h4
                        style={{
                            textAlign: "center",
                            margin: "0 0 0.5rem 0",
                            fontWeight: "bold",
                            fontSize: "16px",
                        }}
                    >
                        ใบเสร็จรับเงิน / Receipt
                    </h4>

                    {/* Info box */}
                    <div
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            padding: "8px",
                            marginBottom: "0.5rem",

                        }}
                    >
                        <table style={{ width: "100%" }}>
                            <tbody>
                                <tr>
                                    <td
                                        //style={{ width: "70%", verticalAlign: "top" }}
                                        style={{
                                            width: "60%",
                                            verticalAlign: "top",
                                           
                                        }}

                                    >
                                        <strong>ผู้เช่า:</strong> {bill.tenantInfo.name}
                                        <br />
                                        <strong>ที่อยู่:</strong>{" "}ห้อง {bill.tenantInfo.roomNumber}
                                    </td>
                                    <td style={{ width: "30%", verticalAlign: "top" }}>
                                        <strong>เลขที่ No.</strong>:{" "}
                                        {String(bill.billId.billId)
                                            .replace("BILL", "RCPT")
                                            .replace("PAY", "RCPT")}
                                        <br />
                                        <strong>วันที่ Date</strong>:{" "}
                                        {dayjs(bill.paymentDate).format("DD/MM/BBBB")}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Items table */}
                    <table className="receipt-table">
                        <thead>
                            <tr>
                                {/* <th style={{ width: "50px" }}>ลำดับ</th> */}
                                <th>รายการ</th>
                                <th style={{ width: "120px" }} className="text-right">
                                    จำนวนเงิน
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {bill.lineItems.map((item, index) => (
                                <React.Fragment key={`line-${item.description}-${index}`}>
                                    <tr
                                        style={{
                                            background: index % 2 === 0 ? "#ffffff" : "#f9f9f9",
                                        }}
                                    >
                                        {/* <td className="text-center" style={{ fontWeight: "bold" }}>
                                            {index + 1}
                                        </td> */}
                                        <td>
                                            <strong>{item.description}</strong>
                                            {item.details && (
                                                <span style={{ fontWeight: "normal" }}>
                                                    {" "}
                                                    {item.details}
                                                </span>
                                            )}

                                            {/* รายละเอียดย่อย */}
                                            {item.description === "ค่าบริการตามบิล" &&
                                                bill.paidItems && (
                                                    <div
                                                        style={{
                                                            marginTop: "4px",
                                                            paddingLeft: "12px",
                                                            fontSize: "11px",
                                                            color: "#555",
                                                        }}
                                                    >
                                                        {bill.paidItems?.map((paid, i) => (
                                                            <div
                                                                key={`paid-${paid.itemId}-${i}`}
                                                                style={{
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    borderBottom:
                                                                        i < bill.paidItems.length - 1
                                                                            ? "1px dotted #ccc"
                                                                            : "none",
                                                                    paddingBottom: "2px",
                                                                    marginBottom: "2px",
                                                                }}
                                                            >
                                                                <span>• {paid.categoryName}</span>
                                                                <span>
                                                                    {paid.paidAmount.toLocaleString("th-TH", {
                                                                        minimumFractionDigits: 2,
                                                                    })}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                        </td>
                                        <td
                                            className="text-right"
                                            style={{ fontWeight: "bold", verticalAlign: "top" }}
                                        >
                                            {item.amount.toLocaleString("th-TH", {
                                                minimumFractionDigits: 2,
                                            })}
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="2" className="text-right" style={{ fontWeight: "bold" }}>
                                    รวมเป็นเงินทั้งสิ้น
                                </td>
                                <td
                                    className="text-right"
                                    style={{ fontWeight: "bold", background: "#eef2ff" }}
                                >
                                    {bill.totalAmount.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                    })}
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Footer */}
                    {/* <div style={{ marginTop: "auto" }}>
                        <span>ชำระโดย: {bill.paymentMethod}</span>
                        <div style={{ marginTop: "2rem", textAlign: "right" }}>
                            <p style={{ margin: 0 }}>.................................................</p>
                            <p style={{ margin: 0 }}>(ผู้รับเงิน)</p>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default PrintableReceiptPage;
