import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
    connectionTimeout: 10000,
    socketTimeout: 10000,
    pool: {
      maxConnections: 5,
      maxMessages: 100,
    },
  });

  private appUrl = process.env.APP_URL || 'http://localhost:3000';
  private from = process.env.MAIL_FROM || 'noreply@indigo.dev';

  async send(to: string, subject: string, html: string) {
    if (!process.env.SMTP_HOST) {
      const error = 'SMTP_HOST is not configured - cannot send email';
      this.logger.error(error);
      throw new Error(error);
    }
    await this.transporter.sendMail({ from: this.from, to, subject, html });
  }

  sendVerification(email: string, token: string) {
    const url = `${this.appUrl}/verify-email?token=${token}`;
    return this.send(email, 'Verify your INDIGO account',
      `<h2>Welcome to INDIGO</h2><p>Confirm your email: <a href="${url}">${url}</a></p>`);
  }

  sendPasswordReset(email: string, token: string) {
    const url = `${this.appUrl}/reset-password?token=${token}`;
    return this.send(email, 'Reset your INDIGO password',
      `<p>Reset your password: <a href="${url}">${url}</a> (expires in 30 min)</p>`);
  }

  sendOrderConfirmation(email: string, order: any) {
    const formatVND = (amount: number | string) => {
      const n = Number(amount);
      if (Number.isNaN(n)) return '0 VNĐ';
      const formatted = new Intl.NumberFormat('vi-VN', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(n);
      return `${formatted} VNĐ`;
    };

    const itemsHtml = order.items.map((item: any) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 0;">
          <div style="font-weight: bold; color: #1e293b;">${item.name}</div>
          <div style="font-size: 12px; color: #64748b;">Size: ${item.size || 'N/A'} | Màu: ${item.color || 'N/A'}</div>
        </td>
        <td style="text-align: center; padding: 10px 0; color: #334155;">${item.quantity}</td>
        <td style="text-align: right; padding: 10px 0; color: #334155; font-weight: bold;">${formatVND(item.unitPrice)}</td>
      </tr>
    `).join('');

    const address = order.shippingAddress as any;
    const addressStr = `${address.line1}, ${address.ward}, ${address.district}, ${address.city}`;

    const discountHtml = Number(order.discount) > 0 ? `
      <tr>
        <td style="padding: 4px 0; color: #64748b;">Giảm giá:</td>
        <td style="padding: 4px 0; text-align: right; color: #dc2626;">-${formatVND(order.discount)}</td>
      </tr>
    ` : '';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1a202c;">
        <div style="text-align: center; border-bottom: 2px solid #312e81; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #312e81; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 2px;">ECHOVE</h1>
          <p style="margin: 5px 0 0 0; color: #4b5563; font-style: italic; font-size: 14px;">Cũ người, chất ta</p>
        </div>
        
        <h2 style="color: #1e1b4b; font-size: 20px; margin-top: 0;">Xác nhận đặt hàng thành công!</h2>
        <p>Xin chào <strong>${address.fullName || order.user?.name || 'quý khách'}</strong>,</p>
        <p>Cảm ơn bạn đã lựa chọn sản phẩm denim tái sinh từ <strong>ECHOVE</strong>. Đơn hàng của bạn đã được tiếp nhận thành công và đang chờ xử lý.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e1b4b; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Thông tin đơn hàng</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Mã đơn hàng:</td>
              <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #312e81;">${order.number}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Phương thức:</td>
              <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #b45309;">Thanh toán khi nhận hàng (COD)</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Địa chỉ giao hàng:</td>
              <td style="padding: 4px 0; text-align: right; color: #334155;">${addressStr}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Số điện thoại:</td>
              <td style="padding: 4px 0; text-align: right; color: #334155;">${address.phone}</td>
            </tr>
          </table>
        </div>

        <h3 style="color: #1e1b4b; font-size: 16px; margin-bottom: 10px;">Chi tiết sản phẩm</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #e2e8f0;">
              <th style="text-align: left; padding: 8px 0; color: #475569;">Sản phẩm</th>
              <th style="text-align: center; padding: 8px 0; color: #475569;">Số lượng</th>
              <th style="text-align: right; padding: 8px 0; color: #475569;">Đơn giá</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="border-top: 2px solid #e2e8f0; padding-top: 10px; font-size: 14px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Tạm tính:</td>
              <td style="padding: 4px 0; text-align: right; color: #334155;">${formatVND(order.subtotal)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Phí vận chuyển:</td>
              <td style="padding: 4px 0; text-align: right; color: #334155;">${Number(order.shipping) === 0 ? 'Miễn phí' : formatVND(order.shipping)}</td>
            </tr>
            ${discountHtml}
            <tr style="font-size: 16px; font-weight: bold; border-top: 1px solid #e2e8f0;">
              <td style="padding: 10px 0; color: #1e1b4b;">Tổng cộng:</td>
              <td style="padding: 10px 0; text-align: right; color: #312e81; font-size: 18px;">${formatVND(order.total)}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 13px; color: #64748b; line-height: 1.6;">
          <p>💡 <strong>Lưu ý:</strong> Với phương thức COD, nhân viên ECHOVE sẽ gọi điện thoại xác nhận đơn hàng trong vòng 2 giờ (giờ làm việc từ 8:00 - 21:00). Bạn có thể kiểm tra hàng trước khi thanh toán cho shipper.</p>
          <p>Nếu bạn muốn hủy đơn hàng này, bạn có thể truy cập vào tài khoản cá nhân trên website ECHOVE và nhấn nút <strong>Hủy đơn hàng</strong> khi đơn hàng vẫn còn ở trạng thái <strong>Chờ xử lý (PENDING)</strong>.</p>
          <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ hotline hoặc gửi email đến <a href="mailto:support@echove.vn" style="color: #312e81; text-decoration: underline;">support@echove.vn</a>.</p>
          <p style="text-align: center; margin-top: 25px; font-weight: bold; color: #475569;">ECHOVE — Tái sinh Denim cũ thành độc bản thời trang</p>
        </div>
      </div>
    `;

    return this.send(email, `[ECHOVE] Xác nhận đơn hàng thành công #${order.number}`, html);
  }

  sendOrderCancellation(email: string, order: any) {
    const formatVND = (amount: number | string) => {
      const n = Number(amount);
      if (Number.isNaN(n)) return '0 VNĐ';
      const formatted = new Intl.NumberFormat('vi-VN', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(n);
      return `${formatted} VNĐ`;
    };

    const address = order.shippingAddress as any;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1a202c;">
        <div style="text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #dc2626; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 2px;">ECHOVE</h1>
          <p style="margin: 5px 0 0 0; color: #4b5563; font-style: italic; font-size: 14px;">Cũ người, chất ta</p>
        </div>
        
        <h2 style="color: #991b1b; font-size: 20px; margin-top: 0;">Đơn hàng đã được hủy thành công</h2>
        <p>Xin chào <strong>${address.fullName || order.user?.name || 'quý khách'}</strong>,</p>
        <p>Chúng tôi xác nhận đơn hàng <strong>#${order.number}</strong> của bạn đã được hủy thành công theo yêu cầu.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #991b1b; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Thông tin đơn hàng đã hủy</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Mã đơn hàng:</td>
              <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #dc2626;">${order.number}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Tổng giá trị đơn hàng:</td>
              <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #1e293b;">${formatVND(order.total)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Trạng thái hiện tại:</td>
              <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #dc2626;">Đã hủy (CANCELLED)</td>
            </tr>
          </table>
        </div>

        <p>Nếu bạn không thực hiện yêu cầu này hoặc có bất kỳ nhầm lẫn nào, vui lòng liên hệ hotline hoặc phản hồi email này ngay lập tức qua địa chỉ <a href="mailto:support@echove.vn" style="color: #dc2626; text-decoration: underline;">support@echove.vn</a> để được trợ giúp.</p>
        
        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 13px; color: #64748b; line-height: 1.6; text-align: center;">
          <p>Hy vọng sẽ được phục vụ bạn trong những đơn hàng tiếp theo!</p>
          <p style="font-weight: bold; color: #475569; margin-top: 15px;">ECHOVE — Tái sinh Denim cũ thành độc bản thời trang</p>
        </div>
      </div>
    `;

    return this.send(email, `[ECHOVE] Xác nhận hủy đơn hàng thành công #${order.number}`, html);
  }

  sendOrderConfirmed(email: string, order: any) {
    const formatVND = (n: any) => `${new Intl.NumberFormat('vi-VN').format(Number(n))} VNĐ`;
    return this.send(email, `[ECHOVE] Đơn hàng được xác nhận #${order.number}`,
      `<p>Đơn hàng của bạn #${order.number} đã được ECHOVE xác nhận và đang được chuẩn bị. Tổng giá: ${formatVND(order.total)}</p>`);
  }

  sendOrderShipped(email: string, order: any, trackingNumber: string) {
    const formatVND = (n: any) => `${new Intl.NumberFormat('vi-VN').format(Number(n))} VNĐ`;
    return this.send(email, `[ECHOVE] Đơn hàng đang giao #${order.number}`,
      `<p>Hàng của bạn đã được gửi đi! Mã theo dõi: <strong>${trackingNumber}</strong></p><p>Tổng giá: ${formatVND(order.total)}</p>`);
  }

  sendOrderDelivered(email: string, order: any) {
    const formatVND = (n: any) => `${new Intl.NumberFormat('vi-VN').format(Number(n))} VNĐ`;
    return this.send(email, `[ECHOVE] Đơn hàng giao thành công #${order.number}`,
      `<p>Đơn hàng của bạn đã được giao thành công! Cảm ơn bạn đã lựa chọn ECHOVE.</p><p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ support@echove.vn</p>`);
  }

  sendOrderRefund(email: string, order: any) {
    const formatVND = (n: any) => `${new Intl.NumberFormat('vi-VN').format(Number(n))} VNĐ`;
    return this.send(email, `[ECHOVE] Đơn hàng hoàn tiền #${order.number}`,
      `<p>Đơn hàng #${order.number} đã được hoàn tiền. Số tiền: ${formatVND(order.total)}</p>`);
  }
}

