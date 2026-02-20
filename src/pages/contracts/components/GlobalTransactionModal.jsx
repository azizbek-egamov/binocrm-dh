'use client';

import React, { useState, useEffect } from 'react';
import { contractService } from '../../../services/contracts';
import Modal from '../../../components/ui/Modal';
import { DollarSignIcon, DownloadIcon } from '../ContractIcons';
import { toast } from 'sonner';

const GlobalTransactionModal = ({ isOpen, onClose, contractId, formatPrice }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    useEffect(() => {
        if (isOpen && contractId) {
            fetchTransactions();
        }
    }, [isOpen, contractId]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await contractService.getTransactions(contractId);
            setTransactions(response.data);
        } catch (error) {
            console.error("Tranzaksiyalarni yuklashda xatolik:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async (transactionId) => {
        setDownloadingId(transactionId);
        toast.loading("Kvitansiya tayyorlanmoqda...", { id: 'receipt-loading' });
        try {
            const response = await contractService.downloadTransactionPdf(contractId, transactionId);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            toast.dismiss('receipt-loading');
            toast.success("Kvitansiya ochildi");
        } catch (error) {
            console.error("PDF yuklashda xatolik:", error);
            toast.dismiss('receipt-loading');
            toast.error("PDF yaratishda xatolik yuz berdi");
        } finally {
            setDownloadingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Umumiy to'lovlar tarixi"
            icon={<DollarSignIcon width="20" height="20" />}
            size="lg"
            footer={
                <button
                    className="btn-v2 btn-v2-secondary"
                    onClick={onClose}
                    type="button"
                >
                    Yopish
                </button>
            }
        >
            <div className="transactions-modal-content">
                {loading ? (
                    <div className="loading-container">Yuklanmoqda...</div>
                ) : transactions.length > 0 ? (
                    <div className="transaction-history-table-container">
                        <table className="transaction-history-table">
                            <thead>
                                <tr>
                                    <th>Sana</th>
                                    <th>Vaqt</th>
                                    <th>Summa</th>
                                    <th>Izoh</th>
                                    <th style={{ textAlign: 'center' }}>Harakat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((t) => (
                                    <tr key={t.id}>
                                        <td>
                                            {(() => {
                                                const date = new Date(t.paid_date);
                                                const months = [
                                                    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
                                                    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
                                                ];
                                                return `${date.getDate()}-${months[date.getMonth()]} ${date.getFullYear()}`;
                                            })()}
                                        </td>
                                        <td>
                                            {new Date(t.paid_date).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="amount-cell text-success">
                                            +{formatPrice(t.amount)}
                                        </td>
                                        <td className="note-cell">
                                            {t.note || "---"}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                className="btn-download-sm"
                                                onClick={() => handleDownloadPdf(t.id)}
                                                disabled={downloadingId === t.id}
                                                title="Kvitansiya yuklash"
                                            >
                                                <DownloadIcon width="16" height="16" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="no-data-alert">
                        Hozircha hech qanday to'lov amalga oshirilmagan
                    </div>
                )}
            </div>

            <style jsx>{`
                .transactions-modal-content {
                    padding: 0;
                }
                .transaction-history-table-container {
                    max-height: 450px;
                    overflow-y: auto;
                    overflow-x: auto;
                    border-radius: 8px;
                    border: 1px solid var(--border-color, #e2e8f0);
                }
                .transaction-history-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                }
                .transaction-history-table th {
                    background: var(--bg-secondary, #f8fafc);
                    padding: 12px 16px;
                    text-align: left;
                    font-weight: 600;
                    color: var(--text-secondary, #64748b);
                    border-bottom: 1px solid var(--border-color, #e2e8f0);
                }
                .transaction-history-table td {
                    padding: 12px 16px;
                    color: var(--text-primary, #1e293b);
                    border-bottom: 1px solid var(--border-color, #e2e8f0);
                }
                .transaction-history-table tr:last-child td {
                    border-bottom: none;
                }
                .amount-cell {
                    font-weight: 600;
                }
                .text-success {
                    color: #10b981;
                }
                .note-cell {
                    color: var(--text-secondary, #64748b);
                    max-width: 250px;
                    word-wrap: break-word;
                    font-style: italic;
                    font-size: 13px;
                }
                .btn-download-sm {
                    background: rgba(34, 197, 94, 0.1);
                    color: #22c55e;
                    border: 1px solid rgba(34, 197, 94, 0.2);
                    padding: 6px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .btn-download-sm:hover {
                    background: #22c55e;
                    color: white;
                    transform: translateY(-1px);
                }
                .btn-download-sm:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .loading-container, .no-data-alert {
                    padding: 40px;
                    text-align: center;
                    color: var(--text-secondary, #64748b);
                }
            `}</style>
        </Modal>
    );
};

export default GlobalTransactionModal;
