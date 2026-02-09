import { AuditOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, HourglassOutlined, PrinterOutlined, RedoOutlined, SendOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Col, DatePicker, Row, Space, Table, Tag, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import ReactDOM from "react-dom/client";
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
// import { getListPayments } from '../../../service/api/bill';
import { canclePayment, confirmPayment, getListPayments } from '../../../service/api/bill';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';
import PaymentDrawerAdmin from '../components/billing-payment/PaymentDrawerForm';

import { checkSlip, listBankAccount, sendMessage } from '../../../service/api/apartment';
import PrintableReceiptPage from './PrintableReceiptPage';
import { number } from 'zod';
import Swal from 'sweetalert2';

// --- Initialize dayjs for Thai locale and Buddhist Era ---
dayjs.extend(buddhistEra);
dayjs.locale('th');

const { Title, Text } = Typography;

// --- Updated API function ---



// mork ไว้ก่อน เพื่อส่ง หากลบค่อยเอากลับไปเป็น props
let slipResults = {
    "apartment": "686799333b510ba15dd697c2",
    "tenant": "68710805252c299df65232e0",
    "success": true,
    "message": "✅",
    "transRef": "202506302Y3bapSlYwdBhB9l4",
    "sendingBank": "014",
    "receivingBank": "004",
    "transDate": "20250630",
    "transTime": "00:42:36",
    "transTimestamp": "2025-06-29T17:42:36.000Z",
    "sender": {
        "displayName": "นาย ประเสริฐ เ",
        "name": null,
        "proxy": {
            "type": null,
            "value": null
        },
        "account": {
            "type": "BANKAC",
            "value": "xxxx-xx613-5"
        }
    },
    "receiver": {
        "displayName": "นาย ประเสริฐ เ",
        "name": null,
        "proxy": {
            "type": null,
            "value": null
        },
        "account": {
            "type": "BANKAC",
            "value": "XXXXX1582X"
        }
    },
    "amount": 11780,
    "paidLocalAmount": null,
    "paidLocalCurrency": null,
    "countryCode": "TH",
    "transFeeAmount": null,
    "ref1": null,
    "ref2": null,
    "ref3": null,
    "toMerchantId": null,
    "qrcodeData": "0046000600000101030140225202506302Y3bapSlYwdBhB9l45102TH9104C051",
    "_id": "6880979a0865077714924afb",
    "createdAt": "2025-07-23T08:04:42.817Z",
    "updatedAt": "2025-07-23T08:04:42.817Z",
    "__v": 0
}
// --- Main component for the page ---
export default function PaymentsPage() {
    const { user, apartmentData } = persistMiddleware();


    const accountId = user?.userPayLoad?.user?.id;
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;



    // --- State for pagination and filtering ---
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filterMonth, setFilterMonth] = useState(dayjs());
    const [open, setOpen] = useState(false);
    const [paymentData, setPaymentData] = useState();




    const [paidBills, setPaidBills] = useState([]);
    const [selectedBank, setSelectedBank] = useState(null);
    //const [slipResult, setSlipResult] = useState(null);
    const [slipResult, setSlipResult] = useState(slipResults);

    const [isSameAmount, setIsSameAmount] = useState(true);
    const [isNotifyAllLoading, setIsNotifyAllLoading] = useState(false);





    const match = matchPath("/apartment/payment/:paymentId", pathname);
    const paymentId = match?.params?.paymentId;


    const previousPathRef = useRef(null)



    // --- Calculate date range for API call ---
    const { fromDate, toDate } = useMemo(() => {
        const startOfMonth = filterMonth.startOf('month').format('YYYY-MM-DD');
        const endOfMonth = filterMonth.endOf('month').format('YYYY-MM-DD');
        return {
            fromDate: startOfMonth,
            toDate: endOfMonth
        };
    }, [filterMonth]);


    // --- API call with pagination and date filtering ---
    const { data: apiData, isLoading, error, refetch } = useQuery({
        queryKey: ['listpayment', accountId, currentPage, pageSize, fromDate, toDate],
        queryFn: () => getListPayments(accountId, currentPage, pageSize, fromDate, toDate),
        enabled: !!accountId,
        keepPreviousData: true, // Keep previous data while loading new data
    });





    const { data: dataBank } = useQuery({
        queryKey: ['listBankAccount'],
        queryFn: () => listBankAccount(accountId),
        enabled: !!accountId
    })




    // แก้ไข findBillById ให้ return เป็น transformed data เหมือน items
    const findBillById = (paymentId, bills) => {
        const rawItem = bills.find(bill =>
            bill.firstPayment.paymentId === paymentId
        );

        if (!rawItem) return null;

        // Transform เป็น format เดียวกับใน transformedData
        const item = rawItem;
        console.log(`⩇⩇:⩇⩇🚨 ~ itemitemitemitemitemitemitemitemitemitem :`, item);


        // Parse month and year from description
        const descriptionParts = item?.firstPayment?.description.split(' ');
        const periodString = descriptionParts.length > 2 ? descriptionParts[2] : '';
        const [monthThai, yearBuddhistStr] = periodString.split('/');
        const yearChristian = yearBuddhistStr ? parseInt(yearBuddhistStr, 10) - 543 : new Date().getFullYear();
        let remainingAmount = item?.firstPayment?.bill?.totalAmount - item?.firstPayment?.bill?.paidAmount
        // Create line items
        const lineItems = [];

        if (item?.firstPayment?.amount > 0) {
            lineItems.push({ description: `ค่าบริการตามบิล`, amount: item?.firstPayment?.amount });
        }
        if (item?.firstPayment?.penaltyAmount > 0) {
            lineItems.push({ description: `ค่าปรับ`, amount: item?.firstPayment?.penaltyAmount });
        }
        if (item?.firstPayment?.totalAmount > 0) {
            lineItems.push({ description: `ยอดรวมทั้งหมด`, amount: item?.firstPayment?.totalAmount });
        }
        if (item?.firstPayment?.bill.paidAmount > 0) {
            lineItems.push({ description: `ยอดชำระแล้ว`, amount: item?.firstPayment?.bill?.paidAmount });
        }
        if (remainingAmount > 0) {
            lineItems.push({ description: `ค้างชำระ`, amount: item?.firstPayment?.totalAmount - item?.firstPayment?.bill?.paidAmount });
        }
        if (item?.firstPayment?.bill.paidAmount - (item?.firstPayment?.bill.totalAmount + item?.firstPayment?.penaltyAmount) > 0) {
            lineItems.push({ description: `ชำระเกิน`, amount: item?.firstPayment?.bill.paidAmount - (item?.firstPayment?.bill.totalAmount + item?.firstPayment?.penaltyAmount) });
        }

        const linePartialPayments = Array.isArray(item.partialPayments)
            ? [...item.partialPayments]
            : [];

        return {
            id: item?.firstPayment?._id,
            paymentId: item?.firstPayment?.paymentId,
            billId: item?.firstPayment?.bill,
            paymentDate: item?.firstPayment?.paymentDate,
            paymentMethod: item?.firstPayment?.paymentMethod === 'transfer' ? 'โอนผ่านธนาคาร' : 'เงินสด',
            paymentStatus: item?.firstPayment?.paymentStatus,
            status: 'unprinted',
            tenantInfo: {
                id: item?.firstPayment?.tenant._id,
                name: `${item?.firstPayment?.tenant.firstName} ${item?.firstPayment?.tenant.lastName}`,
                roomNumber: String(item?.firstPayment?.tenant.room.roomNumber),
                address: 'ไม่ได้ระบุในข้อมูล API',
            },
            billingPeriod: {
                month: monthThai || 'ไม่ระบุ',
                year: yearChristian,
            },
            paidItems: item?.firstPayment?.paidItems,
            lineItems: lineItems.length > 0 ? lineItems : [{ description: 'ยอดรวม', amount: item?.firstPayment?.totalAmount }],
            totalAmount: item?.firstPayment?.totalAmount,
            attachments: item?.firstPayment?.attachments,
            partialPayments: linePartialPayments
        };
    };

    // แล้วใน useEffect ก็เปลี่ยนเป็น
    useEffect(() => {
        if (paymentId && apiData && apiData?.data?.listPayment?.length > 0) {
            const foundBill = findBillById(paymentId, apiData?.data?.listPayment);

            if (foundBill) {
                setPaymentData(foundBill); // ใช้ transformed data ทั้งหมด
                setOpen(true);
            } else {
                console.warn(`Bill with ID ${paymentId} not found`);
                navigate(location.pathname, { replace: true });
            }
        } else if (!paymentId) {
            setPaymentData(null);
            setOpen(false);
        }
    }, [paymentId, apiData, navigate]);

    // เก็บ path ก่อนหน้าไว้ก่อนเปลี่ยนหน้า
    useEffect(() => {
        previousPathRef.prev = location.pathname;

    }, []);




    // --- Transform data for UI ---
    const transformedData = useMemo(() => {
        if (!apiData?.data) {
            return [];
        }



        return apiData?.data?.listPayment.map(item => {

            // Parse month and year from description
            const descriptionParts = item?.firstPayment?.description.split(' ');
            const periodString = descriptionParts.length > 2 ? descriptionParts[2] : '';
            const [monthThai, yearBuddhistStr] = periodString.split('/');
            const yearChristian = yearBuddhistStr ? parseInt(yearBuddhistStr, 10) - 543 : new Date().getFullYear();
            let remainingAmount = item?.firstPayment?.totalAmount - item?.firstPayment?.bill?.paidAmount

            // Create line items
            const lineItems = [];
            if (item?.firstPayment?.amount > 0) {
                lineItems.push({ description: `ค่าบริการตามบิล`, amount: item?.firstPayment?.amount });
            }
            if (item?.firstPayment?.penaltyAmount > 0) {
                lineItems.push({ description: `ค่าปรับ`, amount: item?.firstPayment?.penaltyAmount });
            }
            if (item?.firstPayment?.totalAmount > 0) {
                lineItems.push({ description: `ยอดรวมทั้งหมด`, amount: item?.firstPayment?.totalAmount });
            }
            if (item?.firstPayment?.bill.paidAmount > 0) {
                lineItems.push({ description: `ยอดชำระแล้ว`, amount: item?.firstPayment?.bill?.paidAmount });
            }
            if (remainingAmount > 0) {
                lineItems.push({ description: `ค้างชำระ`, remainingAmount });
            }
            if (item?.firstPayment?.bill.paidAmount - (item?.firstPayment?.bill.totalAmount + item?.firstPayment?.penaltyAmount) > 0) {
                lineItems.push({ description: `ชำระเกิน`, amount: item?.firstPayment?.bill.paidAmount - (item?.firstPayment?.bill.totalAmount + item?.firstPayment?.penaltyAmount) });
            }
            const linePartialPayments = Array.isArray(item.partialPayments)
                ? [...item.partialPayments]
                : [];



            return {
                id: item?.firstPayment?._id,
                paymentId: item?.firstPayment?.paymentId,
                billId: item?.firstPayment?.bill,

                paymentDate: item?.firstPayment?.paymentDate,
                paymentMethod: item?.firstPayment?.paymentMethod === 'transfer' ? 'โอนผ่านธนาคาร' : 'เงินสด',
                paymentStatus: item?.firstPayment?.paymentStatus,
                status: 'unprinted',
                tenantInfo: {
                    id: item?.firstPayment?.tenant._id,
                    name: `${item?.firstPayment?.tenant.firstName} ${item?.firstPayment?.tenant.lastName}`,
                    roomNumber: String(item?.firstPayment?.tenant.room.roomNumber),
                    address: 'ไม่ได้ระบุในข้อมูล API',
                },
                billingPeriod: {
                    month: monthThai || 'ไม่ระบุ',
                    year: yearChristian,
                },
                paidItems: item?.firstPayment?.paidItems,
                lineItems: lineItems.length > 0 ? lineItems : [{ description: 'ยอดรวม', amount: item?.firstPayment?.totalAmount }],
                totalAmount: item?.firstPayment?.totalAmount,
                attachments: item?.firstPayment?.attachments,
                partialPayments: linePartialPayments

            };
        });
    }, [apiData]);








    // --- Update paid bills when transformed data changes ---
    useEffect(() => {
        setPaidBills(transformedData);
    }, [transformedData]);




    // useEffect(() => {

    //     const slipAmount = slipResult?.amount

    //     const totalAmount = paymentData?.totalAmount


    //     const paidAmount = paymentData?.billId?.paidAmount

    //     const outstanding = totalAmount - paidAmount



    //     if (totalAmount === slipAmount || slipAmount > totalAmount || outstanding >= slipAmount) {
    //         setIsSameAmount(true)
    //     } else {
    //         setIsSameAmount(false)
    //     }


    // }, [paymentData, slipResult])

    useEffect(() => {
        if (!slipResult || !paymentData) {
            setIsSameAmount(false);
            return;
        }

        const slipAmount = slipResult?.amount;
        const totalAmount = paymentData?.totalAmount;
        const paidAmount = paymentData?.billId?.paidAmount || 0;

        // คำนวณยอดคงเหลือที่ต้องชำระ
        const outstandingAmount = totalAmount - paidAmount;

        console.log('Payment validation:', {
            slipAmount,
            totalAmount,
            paidAmount,
            outstandingAmount,
            isFirstPayment: paidAmount === 0
        });

        // ตรวจสอบว่าเป็นการชำระครั้งแรกหรือการชำระค้างชำระ
        const isFirstPayment = paidAmount === 0;

        if (isFirstPayment) {
            // การชำระครั้งแรก: เปรียบเทียบกับยอดทั้งหมด
            if (slipAmount === totalAmount) {
                // ชำระครบ
                setIsSameAmount(true);
            } else if (slipAmount < totalAmount && slipAmount > 0) {
                // ชำระบางส่วน (ให้เข้า modal แบ่งจ่าย)
                setIsSameAmount(false);
            } else {
                // จำนวนเงินมากกว่ายอดรวม -> อนุมัติเลย แล้วค่อยทำ refund ภายหลัง
                setIsSameAmount(true);
            }
        } else {
            // การชำระค้างชำระ: เปรียบเทียบกับยอดคงเหลือ
            if (slipAmount === outstandingAmount) {
                // ชำระครบยอดคงเหลือ
                setIsSameAmount(true);
            } else if (slipAmount < outstandingAmount && slipAmount > 0) {
                // ชำระบางส่วนของยอดคงเหลือ
                setIsSameAmount(false);
            } else if (slipAmount > outstandingAmount) {
                // จำนวนเงินมากกว่ายอดคงเหลือ -> อนุมัติเลย แล้วค่อยทำ refund ภายหลัง
                setIsSameAmount(true);
            } else {
                // จำนวนเงินไม่ถูกต้อง
                setIsSameAmount(false);
            }
        }

    }, [paymentData, slipResult]);


    // --- Calculate pagination info ---
    const paginationInfo = useMemo(() => {
        if (!apiData?.pagination) {
            return {
                current: 1,
                pageSize: 10,
                total: 0,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`,
            };
        }

        const { currentPage, totalPages, totalItems, limit } = apiData.pagination;

        return {
            current: currentPage,
            pageSize: limit,
            total: totalItems,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`,
            onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
            },
            onShowSizeChange: (current, size) => {
                setCurrentPage(1); // Reset to first page when changing page size
                setPageSize(size);
            },
        };
    }, [apiData]);

    // --- Filter data (now mostly handled by API, but keep for local filtering if needed) ---
    const filteredData = paidBills.sort((a, b) => dayjs(a.paymentDate).unix() - dayjs(b.paymentDate).unix());


    const unprintedCount = filteredData.filter(bill => bill.status === 'unprinted').length;
    const completedPaymentsCount = useMemo(
        () => filteredData.filter(bill => bill.paymentStatus === 'completed').length,
        [filteredData]
    );

    // --- Handler functions ---
    const onclickNa = (items) => {

        navigate(`/apartment/payment/${items.paymentId}`);
        setOpen(true);
        setPaymentData(items);
    };

    const handleMonthChange = (date) => {
        setFilterMonth(date || dayjs());
        setCurrentPage(1); // Reset to first page when changing month
    };

    // --- Print functions (unchanged) ---
    // const openPrintWindow = (htmlContent) => {
    //     const styles = `<style>
    //         @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
    //         @page { size: A4 portrait; margin: 1cm; }
    //         html, body { height: 100%; margin: 0; padding: 0; }
    //         body { font-family: 'Sarabun', sans-serif; }
    //         .page-layout { display: flex; flex-direction: column; height: 100%; width: 100%; box-sizing: border-box; }
    //         .receipt-half { flex: 1 1 0; min-height: 0; overflow: hidden; }
    //         .cut-line { flex-shrink: 0; border: none; border-top: 2px dashed #999; text-align: center; margin: 1mm 0; }
    //         .cut-line::after { content: '✂'; font-size: 16px; position: relative; top: -12px; background: white; padding: 0 10px; }
    //         .page-break { page-break-after: always; }
    //     </style>`;

    //     const printWindow = window.open('', '_blank');
    //     printWindow.document.write(`<html><head><title>ใบเสร็จรับเงิน</title>${styles}</head><body>${htmlContent}</body></html>`);
    //     printWindow.document.close();
    //     printWindow.focus();
    //     setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    // };



    const openPrintWindow = (content) => {
        const styles = `<style>
      @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
      @page { size: A4 portrait; margin: 1cm; }
      html, body { height: 100%; margin: 0; padding: 0; }
      body { font-family: 'Sarabun', sans-serif; }
      .page-layout { display: flex; flex-direction: column; height: 100%; width: 100%; box-sizing: border-box; }
      .receipt-half { flex: 1 1 0; min-height: 0; overflow: hidden; }
      .cut-line { flex-shrink: 0; border: none; border-top: 2px dashed #999; text-align: center; margin: 1mm 0; }
      .cut-line::after { content: '✂'; font-size: 16px; position: relative; top: -12px; background: white; padding: 0 10px; }
      .page-break { page-break-after: always; }
  </style>`;

        const printWindow = window.open("", "_blank", "width=800,height=600");
        printWindow.document.write(`<html><head><title>ใบเสร็จรับเงิน</title>${styles}</head><body><div id="print-root"></div></body></html>`);
        printWindow.document.close();

        // render React component ลงใน popup
        printWindow.onload = () => {
            ReactDOM.createRoot(printWindow.document.getElementById("print-root"))
                .render(content);

            // สั่ง print หลังจาก render เสร็จ
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        };
    };

    const handlePrintReceipt = (billData) => {




        const customerCopy = <PrintableReceiptPage bill={billData} apartmentData={apartmentData} copyTitle="ฉบับสำหรับลูกค้า (Customer Copy)" />;
        const officeCopy = <PrintableReceiptPage bill={billData} apartmentData={apartmentData} copyTitle="ฉบับสำหรับผู้ประกอบการ (Office Copy)" />;

        const printContent = (
            <div className="page-layout">
                <div className="receipt-half">{customerCopy}</div>
                <hr className="cut-line" />
                <div className="receipt-half">{officeCopy}</div>
            </div>
        );

        openPrintWindow(printContent);

        setPaidBills((currentBills) =>
            currentBills.map((b) =>
                b.billId === billData.billId ? { ...b, status: "printed" } : b
            )
        );
    };


    // const handlePrintReceipt = (billData) => {

    //     const customerCopy = ReactDOMServer.renderToString(<PrintableReceiptPage bill={billData} copyTitle="ฉบับสำหรับลูกค้า (Customer Copy)" />);


    //     const officeCopy = ReactDOMServer.renderToString(<PrintableReceiptPage bill={billData} copyTitle="ฉบับสำหรับผู้ประกอบการ (Office Copy)" />);

    //     const printHtml = `<div class="page-layout">
    //         <div class="receipt-half">${customerCopy}</div>
    //         <hr class="cut-line" />
    //         <div class="receipt-half">${officeCopy}</div>
    //     </div>`;

    //     openPrintWindow(printHtml);
    //     setPaidBills(currentBills => currentBills.map(b => b.billId === billData.billId ? { ...b, status: 'printed' } : b));
    // };

    const handlePrintAll = () => {
        const billsToPrint = filteredData.filter(bill => bill.status === 'unprinted');
        if (billsToPrint.length === 0) return;

        let allReceiptsHtml = '';
        billsToPrint.forEach((bill, index) => {
            const customerCopy = ReactDOMServer.renderToString(<PrintableReceiptPage bill={bill} apartmentData={apartmentData} copyTitle="ฉบับสำหรับลูกค้า (Customer Copy)" />);
            const officeCopy = ReactDOMServer.renderToString(<PrintableReceiptPage bill={bill} apartmentData={apartmentData} copyTitle="ฉบับสำหรับผู้ประกอบการ (Office Copy)" />);

            allReceiptsHtml += `<div class="page-layout">
                <div class="receipt-half">${customerCopy}</div>
                <hr class="cut-line" />
                <div class="receipt-half">${officeCopy}</div>
            </div>`;

            if (index < billsToPrint.length - 1) {
                allReceiptsHtml += '<div class="page-break"></div>';
            }
        });

        openPrintWindow(allReceiptsHtml);

        const printedBillIds = billsToPrint.map(b => b.billId);
        setPaidBills(currentBills => currentBills.map(b => printedBillIds.includes(b.billId) ? { ...b, status: 'printed' } : b));
    };



    const handleCheckSlip = async (data) => {

        try {
            const values = {
                accountId: accountId,
                accountNumber: selectedBank.accountNumber,
                attachments: data.attachments,
                billId: data.billId._id,
                tenant: data.tenantInfo.id


            }


            const res = await checkSlip(values)

            if (res.status === 201) {
                setSlipResult(res.slip)
            }

        } catch (error) {
            console.log(`⩇⩇:⩇⩇🚨 ~ error :`, error);


        }

    }

    const handleConfirm = async (data) => {


    }

    const handleConfirmSlip = async (data, slipPayment) => {

        const newPaidAmount = slipPayment?.amount;
        console.log(`⩇⩇:⩇⩇🚨 ~ newPaidAmount :`, newPaidAmount);


        const newRemainingAmount = (data?.billId?.totalAmount + data?.billId?.penaltyAmount - data?.billId?.paidAmount) - newPaidAmount;




        const isFullPayment = newRemainingAmount <= 0;


        const values = {
            paymentAmount: slipPayment.amount,
            paymentMethod: data.paymentMethod,
            reference: '',
            description: '',
            accountId: accountId,
            billId: data.billId._id,
            billNumber: data.billId.billNumber,
            paymentId: data.paymentId,
            tenant: data.tenantInfo.id,
            isFullPayment: isFullPayment,
            newPaidAmount: slipPayment.amount,
            newRemainingAmount: newRemainingAmount,
        }




        const response = await confirmPayment(values)


        if (response.success) {
            Swal.fire('ยืนยันการชำระเงินสำเร็จ')
            refetch()
        }

    }

    const handleCanceledSlip = async (data, slipPayment) => {


        const newPaidAmount = slipPayment?.amount;

        const newRemainingAmount = (data?.billId?.totalAmount + data?.billId?.penaltyAmount) - newPaidAmount;







        const isFullPayment = newRemainingAmount <= 0;


        const values = {
            paymentAmount: slipPayment.amount,
            paymentMethod: data.paymentMethod,
            reference: '',
            description: '',
            accountId: accountId,
            billId: data.billId._id,
            billNumber: data.billId.billNumber,
            paymentId: data.paymentId,
            tenant: data.tenantInfo.id,
            isFullPayment: isFullPayment,
            newPaidAmount: slipPayment.amount,
            newRemainingAmount: newRemainingAmount,
        }
        console.log(`⩇⩇:⩇⩇🚨 ~ values :`, values);

        const response = await canclePayment(values)

    }


    const buildNotifyPayload = (data) => {
        if (!data?.billId || !data?.tenantInfo) {
            return null;
        }

        return {
            apartmentId: apartmentData?.result?._id,
            accountId: accountId,
            tenantId: data.tenantInfo.id,
            billId: data.billId?._id || data.billId,
            billNumber: data.billId?.billNumber,
            paymentId: data.paymentId,
            paymentMethod: data.paymentMethod,
            paymentAmount: data.paymentAmount ?? data.totalAmount,
            paymentDate: data.paymentDate,
            paymentStatus: data.paymentStatus,
            paymentDescription: data.paymentDescription,
            paymentReference: data.paymentReference,
            paymentCustomNote: data.paymentCustomNote,
            paymentTimestamp: data.paymentTimestamp,
            billingPeriod: data.billId?.billingPeriod,
            paidAmount: data.billId?.paidAmount,
            tenantInfo: data.tenantInfo,
            social: 'telegram',
        };
    };

    const handleNotifyPayment = async (data) => {
        try {
            const values = buildNotifyPayload(data);
            if (!values) {
                throw new Error('missing bill data');
            }
            await sendMessage(values);
            Swal.fire({
                icon: 'success',
                title: 'ส่งแจ้งเตือนแล้ว',
                text: `ห้อง ${data?.tenantInfo?.roomNumber || ''}`,
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('handleNotifyPayment error', error);
            Swal.fire({
                icon: 'error',
                title: 'ไม่สามารถส่งแจ้งเตือน',
                text: 'กรุณาลองใหม่อีกครั้ง'
            });
        }
    };

    const handleNotifyAllPayments = async () => {
        const completedPayments = filteredData.filter(item => item.paymentStatus === 'completed');
        if (completedPayments.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'ยังไม่มีรายการพร้อมส่ง',
                text: 'ต้องเป็นรายการที่ชำระแล้วเท่านั้น'
            });
            return;
        }

        setIsNotifyAllLoading(true);
        try {
            const payloads = completedPayments.map(buildNotifyPayload).filter(Boolean);
            await Promise.all(payloads.map(payload => sendMessage(payload)));
            Swal.fire({
                icon: 'success',
                title: 'ส่งแจ้งเตือนทั้งหมดแล้ว',
                text: `จำนวน ${payloads.length} รายการ`
            });
        } catch (error) {
            console.error('handleNotifyAllPayments error', error);
            Swal.fire({
                icon: 'error',
                title: 'ส่งแจ้งเตือนไม่สำเร็จ',
                text: 'กรุณาลองใหม่อีกครั้ง'
            });
        } finally {
            setIsNotifyAllLoading(false);
        }
    };


    const onClose = () => {
        setOpen(false);
        navigate(`/apartment/payment`);

    };


    // --- Column definitions ---
    const columns = [
        {
            title: 'วันที่ชำระ',
            dataIndex: 'paymentDate',
            key: 'paymentDate',
            render: (text) => dayjs(text).locale('th').format('D MMM BB HH:mm น.')
        },
        {
            title: 'เลขห้อง',
            dataIndex: ['tenantInfo', 'roomNumber'],
            key: 'roomNumber',
            render: (text) => <Tag color="purple">{text}</Tag>
        },
        {
            title: 'ชื่อผู้เช่า',
            dataIndex: ['tenantInfo', 'name'],
            key: 'name'
        },
        {
            title: 'ยอดชำระ (บาท)',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            align: 'right',
            render: (amount) => <Text strong className="text-green-600">{amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
        },
        {
            title: 'สถานะ',
            key: 'status',
            render: (_, record) => {
                const status = record.paymentStatus;
                const statusMap = {
                    pending: { color: 'warning', label: 'รอดำเนินการ', icon: <ClockCircleOutlined /> },
                    waiting: { color: 'warning', label: 'รอการตรวจสอบ', icon: <HourglassOutlined /> },
                    completed: { color: 'success', label: 'ชำระแล้ว', icon: <CheckCircleOutlined /> },
                    failed: { color: 'error', label: 'ชำระไม่สำเร็จ', icon: <CloseCircleOutlined /> },
                    refunded: { color: 'processing', label: 'คืนเงินแล้ว', icon: <RedoOutlined /> },
                    outstanding: { color: 'error', label: 'ค้างชำระ', icon: <CloseCircleOutlined /> },
                    rejected: { color: 'error', label: 'ปฏิเสธการชำระ', icon: <CloseCircleOutlined /> }
                };
                const statusInfo = statusMap[status] || { color: 'default', label: 'ไม่ทราบสถานะ' };

                return (
                    <Tag icon={statusInfo.icon} color={statusInfo.color}>{statusInfo.label}</Tag>
                );
            }
        },
        {
            title: 'การดำเนินการ',
            key: 'action',
            align: 'center',
            render: (_, record) => {


                return <>

                    <Space>
                        <Tooltip title={record.status === 'printed' ? 'ใบเสร็จนี้ถูกพิมพ์แล้ว' : 'พิมพ์ใบเสร็จรับเงิน'}>
                            <Button
                                icon={<PrinterOutlined />}
                                onClick={() => handlePrintReceipt(record)}
                                disabled={record.status === 'printed' || record.paymentStatus !== 'completed'}
                                className={record.status === 'printed' ? '' : `!bg-indigo-500 !text-white hover:!bg-indigo-400 !border-indigo-500 ${record.paymentStatus !== 'completed' ? '!opacity-50 !cursor-not-allowed' : ''}`}
                            >
                                พิมพ์ใบเสร็จ
                            </Button>
                        </Tooltip>
                        <Button

                            type='primary'
                            onClick={() => onclickNa(record)}>
                            รายละเอียด
                        </Button>
                        <Button
                            type="default"
                            disabled={record.paymentStatus !== 'completed'}
                            onClick={() => handleNotifyPayment(record)}
                            className={`!bg-yellow-500 !text-white hover:!bg-yellow-400 !border-yellow-500 ${record.paymentStatus !== 'completed' ? '!opacity-50 !cursor-not-allowed' : ''}`}
                        >
                            แจ้งเตือนชำระ
                        </Button>


                    </Space>

                </>
            }
        },
    ];

    // --- Error handling ---
    if (error) {
        console.error('Error loading payments:', error);
    }

    // --- Main component JSX ---
    return (
        <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
            <Card className="max-w-7xl mx-auto shadow-lg rounded-2xl">
                <Space direction="vertical" size="large" className="w-full">

                    {/* Page Header */}
                    <div className="p-4 bg-indigo-50 rounded-xl">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:items-center w-full">

                            {/* Left Section */}
                            <div className="flex items-start gap-4 min-w-0">
                                <AuditOutlined className="text-3xl text-indigo-500 shrink-0" />
                                <div className="min-w-0">
                                    <Title level={4} className="!mb-0 !text-slate-800 text-lg sm:text-xl whitespace-normal break-words">
                                        หน้าออกใบเสร็จรับเงิน
                                    </Title>
                                    <Text type="secondary" className="text-sm whitespace-normal break-words">
                                        สำหรับห้องที่ชำระบิลแล้ว
                                    </Text>
                                </div>
                            </div>

                            {/* Right Section */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Text className="font-medium whitespace-nowrap">เลือกเดือน:</Text>
                                    <DatePicker
                                        picker="month"
                                        value={filterMonth}
                                        onChange={handleMonthChange}
                                        format="MMMM BBBB"
                                        className="w-full sm:w-auto"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                    <Button
                                        type="primary"
                                        icon={<PrinterOutlined />}
                                        onClick={handlePrintAll}
                                        disabled={unprintedCount === 0}
                                        className="bg-indigo-600 hover:bg-indigo-700 shadow-md w-full sm:w-auto"
                                    >
                                        พิมพ์ที่ยังไม่พิมพ์ ({unprintedCount})
                                    </Button>
                                    <Button
                                        icon={<SendOutlined />}
                                        onClick={handleNotifyAllPayments}
                                        loading={isNotifyAllLoading}
                                        disabled={completedPaymentsCount === 0}
                                        className="w-full sm:w-auto border-indigo-200 text-indigo-600"
                                    >
                                        ส่งแจ้งเตือนทั้งหมด ({completedPaymentsCount})
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* --- Data Table --- */}
                    <Table
                        loading={isLoading}
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="paymentId"
                        pagination={paginationInfo}
                        scroll={{ x: 'max-content' }}
                    />
                </Space>
            </Card>

            {/* --- Drawer Component --- */}
            <PaymentDrawerAdmin
                open={!!paymentId && !!setPaymentData}
                onClose={onClose}
                paymentData={paymentData}
                handleCheckSlip={handleCheckSlip}
                bankData={dataBank}
                setSelectedBank={setSelectedBank}
                selectedBank={selectedBank}
                slipResult={slipResult}
                handleConfirmSlip={handleConfirmSlip}
                isSameAmount={isSameAmount}
                accountId={accountId}
                // handleConfirm={handleConfirm}
                isSlipCheckEnabled={dataBank?.result?.apartment?.isSlipCheckEnabled}
                handleCanceledSlip={handleCanceledSlip}

            />
        </div>

    );
}