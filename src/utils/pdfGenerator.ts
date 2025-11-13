import html2pdf from 'html2pdf.js';
import { format } from 'date-fns';
import { GatePass } from '../types';
import logoImage from '../assets/mit-adt-logo.png';

const getHeaderWithLogo = (title: string, passNumber?: string, date?: string) => `
    <div style="font-family: Arial, sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 20px;">
                <img src="${logoImage}" alt="MIT ADT University Logo" style="height: 80px;" />
                <h1 style="margin: 0; color: #4B0082; font-size: 28px;">${title}</h1>
            </div>
            ${passNumber && date ? `
                <div style="text-align: right;">
                    <div style="font-size: 1.2em; font-weight: bold; color: #4B0082;">${passNumber}</div>
                    <div style="color: #666;">Date: ${date}</div>
                </div>
            ` : ''}
        </div>
        
        <!-- Decorative line inspired by MIT ADT's logo -->
        <div style="height: 4px; background: linear-gradient(to right, 
            #4B0082 0%, #4B0082 25%, 
            #FF6B6B 25%, #FF6B6B 50%,
            #4ECDC4 50%, #4ECDC4 75%,
            #45B7D1 75%, #45B7D1 100%); 
            margin-bottom: 20px;"></div>
    </div>
`;

const defaultPdfOptions = {
    margin: 10,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
};

export const generateUsersPDF = async (users: any[]) => {
    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column;">
            <!-- Header and main content wrapper -->
            <div style="flex: 1;">
                ${getHeaderWithLogo(
        'Digital Gate Pass System - Users List',
        undefined,
        format(new Date(), 'MMM dd, yyyy')
    )}

                <!-- Users Table -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #4B0082; margin-bottom: 15px;">Registered Users</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #4B0082;">
                                <th style="padding: 12px; color: white; text-align: left; border: 1px solid #ddd;">Name</th>
                                <th style="padding: 12px; color: white; text-align: left; border: 1px solid #ddd;">Email</th>
                                <th style="padding: 12px; color: white; text-align: left; border: 1px solid #ddd;">Role</th>
                                <th style="padding: 12px; color: white; text-align: left; border: 1px solid #ddd;">Department</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map((user, index) => `
                                <tr style="background-color: ${index % 2 === 0 ? '#fff' : '#f8f9fa'}">
                                    <td style="padding: 12px; border: 1px solid #ddd;">${user.name}</td>
                                    <td style="padding: 12px; border: 1px solid #ddd;">${user.email}</td>
                                    <td style="padding: 12px; border: 1px solid #ddd;">
                                        <span style="
                                            padding: 4px 8px;
                                            border-radius: 4px;
                                            font-size: 0.85em;
                                            background-color: ${user.role === 'admin' ? '#E5D1F2' :
            user.role === 'faculty' ? '#F0E6FA' : '#F8F4FC'
        };
                                            color: ${user.role === 'admin' ? '#4B0082' :
            user.role === 'faculty' ? '#6B238E' : '#9B4BC0'
        };"
                                        >
                                            ${user.role}
                                        </span>
                                    </td>
                                    <td style="padding: 12px; border: 1px solid #ddd;">${user.department || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Footer section -->
            <div style="margin-top: auto; padding-top: 40px;">
                <div style="text-align: center; border-top: 1px solid #ddd; padding-top: 20px;">
                    <p style="color: #666; font-size: 0.9em; margin-bottom: 10px;">This is a computer-generated document. No signature is required.</p>
                    <div style="height: 3px; background: linear-gradient(to right, #4B0082, #6B238E, #9B4BC0, #E5D1F2);"></div>
                </div>
            </div>
        </div>
    `;

    const options = {
        ...defaultPdfOptions,
        filename: `users-list-${format(new Date(), 'yyyy-MM-dd')}.pdf`
    };

    const element = document.createElement('div');
    element.innerHTML = content;
    document.body.appendChild(element);

    await html2pdf().set(options).from(element).save();

    document.body.removeChild(element);
};

export const generateGatePassPDF = async (gatePass: GatePass) => {
    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column;">
            <!-- Header and main content wrapper -->
            <div style="flex: 1;">
                ${getHeaderWithLogo(
        'Digital Gate Pass',
        gatePass.passNumber,
        format(new Date(gatePass.createdAt), 'MMM dd, yyyy')
    )}

                <!-- Rest of the content -->
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #4B0082;">
                    <h3 style="margin: 0 0 15px 0; color: #4B0082;">Submitter Information</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        <div>
                            <p style="margin: 0; color: #666;">Name</p>
                            <p style="margin: 5px 0; font-weight: 600;">${gatePass.submittedBy.name}</p>
                        </div>
                        <div>
                            <p style="margin: 0; color: #666;">Contact</p>
                            <p style="margin: 5px 0; font-weight: 600;">${gatePass.submittedBy.contact}</p>
                        </div>
                        <div>
                            <p style="margin: 0; color: #666;">Department</p>
                            <p style="margin: 5px 0; font-weight: 600;">${gatePass.department}</p>
                        </div>
                        <div>
                            <p style="margin: 0; color: #666;">Purpose</p>
                            <p style="margin: 5px 0; font-weight: 600;">${gatePass.submittedBy.purpose}</p>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <h3 style="color: #4B0082; margin-bottom: 15px;">Item Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #4B0082;">
                                <th style="padding: 12px; color: white; text-align: left; border: 1px solid #ddd;">Item Name</th>
                                <th style="padding: 12px; color: white; text-align: left; border: 1px solid #ddd;">Quantity</th>
                                <th style="padding: 12px; color: white; text-align: left; border: 1px solid #ddd;">Description</th>
                                <th style="padding: 12px; color: white; text-align: center; border: 1px solid #ddd;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${gatePass.items.map((item: any, index: number) => `
                                <tr style="background-color: ${index % 2 === 0 ? '#fff' : '#f8f9fa'}">
                                    <td style="padding: 12px; border: 1px solid #ddd;">${item.name}</td>
                                    <td style="padding: 12px; border: 1px solid #ddd;">${item.quantity}</td>
                                    <td style="padding: 12px; border: 1px solid #ddd;">${item.description}</td>
                                    <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">
                                        ${item.isChecked ?
            '<span style="color: #4ECDC4;">✓ Verified</span>' :
            '<span style="color: #666;">Not verified</span>'
        }
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #4B0082;">
                    <h3 style="margin: 0 0 15px 0; color: #4B0082;">Approval Status</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        ${Object.entries(gatePass.approvalStages).map(([stage, data]: [string, any]) => `
                            <div>
                                <p style="margin: 0; color: #666;">${stage.replace(/([A-Z])/g, ' $1').trim()}</p>
                                <div style="margin: 5px 0;">
                                    ${getStatusBadgeHTML(data.status)}
                                    ${data.remarks ? `<p style="margin: 5px 0; font-size: 0.9em; color: #666;">${data.remarks}</p>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Footer section -->
            <div style="margin-top: auto; padding-top: 40px;">
                <div style="text-align: center; border-top: 1px solid #ddd; padding-top: 20px;">
                    <p style="color: #666; font-size: 0.9em; margin-bottom: 10px;">This is a computer-generated document. No signature is required.</p>
                    <div style="height: 3px; background: linear-gradient(to right, #4B0082, #FF6B6B, #4ECDC4, #45B7D1);"></div>
                </div>
            </div>
        </div>
    `;

    const options = {
        ...defaultPdfOptions,
        filename: `gate-pass-${gatePass.passNumber}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
    };

    const element = document.createElement('div');
    element.innerHTML = content;
    document.body.appendChild(element);

    await html2pdf().set(options).from(element).save();

    document.body.removeChild(element);
};

export const generateAnalyticsReportPDF = async (data: any) => {
    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column;">
            <!-- Header and main content wrapper -->
            <div style="flex: 1;">
                ${getHeaderWithLogo(
        'Digital Gate Pass System - Analytics Report',
        undefined,
        format(new Date(), 'MMM dd, yyyy')
    )}

                <!-- Summary Cards -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #4B0082; margin-bottom: 15px;">Summary</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                        <div style="background-color: #F8F4FC; padding: 15px; border-radius: 8px; border-left: 4px solid #4B0082;">
                            <div style="font-size: 2em; color: #4B0082;">${data.approvedPasses}</div>
                            <div style="color: #6B238E;">Approved Passes</div>
                        </div>
                        <div style="background-color: #F8F4FC; padding: 15px; border-radius: 8px; border-left: 4px solid #6B238E;">
                            <div style="font-size: 2em; color: #4B0082;">${data.rejectedPasses}</div>
                            <div style="color: #6B238E;">Rejected Passes</div>
                        </div>
                        <div style="background-color: #F8F4FC; padding: 15px; border-radius: 8px; border-left: 4px solid #9B4BC0;">
                            <div style="font-size: 2em; color: #4B0082;">${data.pendingPasses}</div>
                            <div style="color: #6B238E;">Pending Passes</div>
                        </div>
                    </div>
                </div>

                <!-- Department Statistics -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #4B0082; margin-bottom: 15px;">Department-wise Distribution</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #4B0082;">
                                <th style="padding: 12px; color: white; text-align: left; border: 1px solid #ddd;">Department</th>
                                <th style="padding: 12px; color: white; text-align: center; border: 1px solid #ddd;">Total Passes</th>
                                <th style="padding: 12px; color: white; text-align: center; border: 1px solid #ddd;">Approved</th>
                                <th style="padding: 12px; color: white; text-align: center; border: 1px solid #ddd;">Rejected</th>
                                <th style="padding: 12px; color: white; text-align: center; border: 1px solid #ddd;">Pending</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(data.departmentStats).map(([dept, stats]: [string, any], index) => `
                                <tr style="background-color: ${index % 2 === 0 ? '#fff' : '#f8f9fa'}">
                                    <td style="padding: 12px; border: 1px solid #ddd;">${dept}</td>
                                    <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">
                                        <span style="color: #4B0082; font-weight: 600;">${stats.total}</span>
                                    </td>
                                    <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">
                                        <span style="color: #4B0082;">${stats.approved}</span>
                                    </td>
                                    <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">
                                        <span style="color: #6B238E;">${stats.rejected}</span>
                                    </td>
                                    <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">
                                        <span style="color: #9B4BC0;">${stats.pending}</span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Footer section -->
            <div style="margin-top: auto; padding-top: 40px;">
                <div style="text-align: center; border-top: 1px solid #ddd; padding-top: 20px;">
                    <p style="color: #666; font-size: 0.9em; margin-bottom: 10px;">This is a computer-generated document. No signature is required.</p>
                    <div style="height: 3px; background: linear-gradient(to right, #4B0082, #6B238E, #9B4BC0, #E5D1F2);"></div>
                </div>
            </div>
        </div>
    `;

    const options = {
        ...defaultPdfOptions,
        filename: `gate-pass-analytics-${format(new Date(), 'yyyy-MM-dd')}.pdf`
    };

    const element = document.createElement('div');
    element.innerHTML = content;
    document.body.appendChild(element);

    await html2pdf().set(options).from(element).save();

    document.body.removeChild(element);
};

const getStatusBadgeHTML = (status: string) => {
    const styles = {
        approved: {
            bg: '#E8F5E9',
            color: '#2E7D32',
            text: 'Approved'
        },
        rejected: {
            bg: '#FFEBEE',
            color: '#C62828',
            text: 'Rejected'
        },
        pending: {
            bg: '#FFF3E0',
            color: '#EF6C00',
            text: 'Pending'
        },
        default: {
            bg: '#F5F5F5',
            color: '#666666',
            text: 'Not Started'
        }
    };

    const style = styles[status as keyof typeof styles] || styles.default;

    return `<span style="
        background-color: ${style.bg}; 
        color: ${style.color}; 
        padding: 4px 12px; 
        border-radius: 12px; 
        font-size: 0.85em;
        display: inline-block;
        font-weight: 500;
    ">${style.text}</span>`;
}; 