import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, FileCheck2, Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { BUSINESS_CONFIG, getWhatsAppUrl } from '../data/businessConfig';
import { COMMERCE } from '../data/commerce';
import './PolicyPage.css';

export const POLICY_LINKS = [['Privacy', '/privacy'], ['Terms', '/terms'], ['Returns & changes', '/returns'], ['Shipping & delivery', '/shipping'], ['Original print files', '/original-files']];
const policies = {
  '/privacy': { eyebrow: 'YOUR PHOTOS. YOUR PRIVACY.', title: <>A little clarity.<br /><em>Your information, with care.</em></>, intro: 'How your order details, photographs and browser storage are used by the AL-NOOR studio.', sections: [
    ['What you share', 'When you save an order or enquiry, we receive the details you provide: your name, mobile number, email, delivery details, selected products, personalisation and preview images. Original files you choose to upload are stored privately with that order.'],
    ['Why we use it', 'We use these details to prepare your quote, confirm artwork, process your order, arrange delivery, show tracking updates and respond to support requests. Customer photographs are not automatically published in our website gallery.'],
    ['Original files and access', 'Original print files are available through the private studio desk. Keep your private tracking link to yourself and only share files needed for the order. For access, correction or a deletion request, contact the studio with your order reference. We will explain any order or payment records that need to be retained.'],
    ['Payments and other providers', 'If online payment is enabled, payment information is entered in Razorpay’s hosted checkout. The website keeps payment references and verification status; it does not ask for or store your card number, CVV or UPI PIN. Delivery details may be shared with the courier handling your order. WhatsApp and email enquiries are handled by those services when you choose to use them.'],
    ['Storage on your device', 'Your browser keeps the shopping bag and recent tracking references. Builders can keep original photos on this device so you can upload them after saving an order. Clearing website data removes these local copies, but does not delete an order or files already saved with the studio. Studio sign-in uses a session cookie.'],
    ['Fonts and illustrative images', 'Some pages load fonts from Google and illustrative images from Unsplash. Your browser connects to those services to display them. Contact the studio if you have a question about how your information is used.'],
  ] },
  '/terms': { eyebrow: 'A FEW DETAILS, BEFORE WE CREATE.', title: <>Your order.<br /><em>Thoughtfully understood.</em></>, intro: 'A clear guide to placing a personalised order, approving its details and keeping track of progress.', sections: [
    ['Saving and confirming an order', 'Saving your request creates an order reference. It does not by itself mean that payment is verified, artwork is approved or production has started. The studio confirms availability, artwork and fulfilment details and updates the order status.'],
    ['Your personalised selection', 'Check names, spelling, quantity, size, orientation and crop before ordering. Preview colours can vary between screens and physical prints; outside frame dimensions depend on the chosen moulding. Ask the studio for any detail you need confirmed before production.'],
    ['Prices, quotes and payment', 'Review the item total, discount and delivery charge shown at checkout. Custom options without a listed price are saved for a studio quote. Online payment uses the final amount verified by the server. An order is marked paid only after payment verification or a studio-recorded receipt.'],
    ['Artwork you provide', 'Only share photographs and artwork you have permission to reproduce. Send the original file for the best print and use the file notes to identify its intended item. Avoid uploading unrelated identity documents, passwords or payment credentials.'],
    ['Changes and fulfilment', 'Contact the studio promptly if you need to change or cancel a request. Whether a requested design change can still be made depends on the production stage. Use the returns and changes page for damaged, incorrect or other problem orders.'],
    ['Support and customer rights', 'Use your order reference when contacting the studio. These website terms do not remove any rights available under applicable consumer law. Delivery, payment and refund concerns can be raised using the support details below.'],
  ] },
  '/returns': { eyebrow: 'LET’S PUT THE DETAILS RIGHT.', title: <>Order changes.<br /><em>Help, when you need it.</em></>, intro: 'A direct way to ask about a correction, cancellation, damaged delivery or refund.', sections: [
    ['Need to change a personalised order?', 'Send your reference and the exact change as soon as you can. The studio will check whether artwork approval or production has already taken place and explain the available options. Please get a change confirmed before assuming the print will be different.'],
    ['Damaged, incorrect or defective delivery', 'Contact the studio with your order reference, a description of the problem and clear photographs of the item and packaging. Keep the packaging available while the issue is reviewed. Personalisation does not remove rights relating to a defective, damaged or incorrectly supplied product.'],
    ['Cancellation requests', 'Ask the studio to review the order’s current stage. A cancellation shown in tracking does not automatically issue a payment refund. The studio will separately confirm any payment adjustment or refund.'],
    ['Refund confirmation', 'The studio confirms the agreed remedy, refund amount and next steps after reviewing the request. Online refunds are handled through the payment provider; the time for the credit to appear can depend on that provider and your bank. Ask for the refund reference once it has been processed.'],
    ['Before sending an item back', 'Contact the studio first to confirm the return address, packaging instructions and the handling of any return delivery charge. Include the order reference so the parcel can be matched to your request. This process does not limit your applicable consumer rights.'],
  ] },
  '/shipping': { eyebrow: 'FROM OUR STUDIO TO YOUR DOOR.', title: <>Packed with thought.<br /><em>Delivered with clarity.</em></>, intro: 'Review the delivery amount at checkout, then follow the studio’s updates for your order.', sections: [
    ['Current delivery charges', `Standard delivery is ₹${COMMERCE.deliveryFee}; it is free when the item subtotal is ₹${COMMERCE.freeDeliveryThreshold} or more. The threshold uses the item subtotal before a coupon discount. An express request adds ₹${COMMERCE.expressExtra}; availability is confirmed by the studio. The total is shown before the order is saved or online payment is opened.`],
    ['Where and when', 'Delivery availability and the expected dispatch or arrival date are confirmed for your address and order. Custom work needs the original files and artwork approval before production. There is no single guaranteed delivery time for every personalised order.'],
    ['Address and mobile number', 'Check your street address, city, state, six-digit PIN code and mobile number carefully. Contact the studio with your reference if a delivery detail needs to change before dispatch.'],
    ['Track on the website', 'The studio updates your order progress. Once dispatch details are added, your courier name, AWB and available courier tracking link appear on the tracking page. Collection arrangements can also be confirmed with the studio.'],
    ['Delivery problems', 'For damage, a wrong item or another delivery issue, use the returns and changes page and contact the studio with the order reference and relevant photos. For a missed or delayed parcel, share the AWB if one has been issued.'],
  ] },
  '/original-files': { eyebrow: 'THE BEST PRINT STARTS HERE.', title: <>Your original photo.<br /><em>Ready for its next chapter.</em></>, intro: 'Keep your original resolution, connect files to the right order and help the studio prepare a clear print.', sections: [
    ['1. Save your order or enquiry', 'Review your selection and save it to get an order reference and private tracking link. Keep the checkout mobile number handy if you need to open the order on another device.'],
    ['2. Send the original files', 'Use “Original print files” on the saved order or tracking page. You can upload photos saved by the builders on this device, or choose original files again. JPG, PNG, WebP and PDF are supported: up to 20 MB per file, 50 files and 250 MB per order.'],
    ['3. Match each file to its item', 'Use the file note to identify the photo, frame position, front/back design or item number. Uploads from the device’s saved builder photos include an item label. Check the uploaded list and keep your own copy.'],
    ['4. Confirm the print with the studio', 'Uploading a file records its receipt; it does not automatically approve the artwork. The studio checks the files, crop and personalisation before confirming production. If an upload fails or the file is too large, share it through the studio’s WhatsApp or email and include the order reference.'],
    ['A few helpful habits', 'Choose the camera original rather than a screenshot or compressed forward. Send PDF artwork at its intended print size. If you have several designs, use clear filenames and a matching list. Only share material needed for the order.'],
  ] },
};

export default function PolicyPage() {
  const { pathname } = useLocation();
  const page = policies[pathname] || policies['/privacy'];
  return <div className="policy-page"><div className="policy-wrap">
    <Link className="policy-breadcrumb" to="/contact">The studio / Customer care</Link>
    <header className="policy-hero"><span className="policy-kicker"><ShieldCheck size={15} />{page.eyebrow}</span><h1>{page.title}</h1><p>{page.intro}</p></header>
    <nav className="policy-nav" aria-label="Customer information">{POLICY_LINKS.map(([label, to]) => <Link key={to} to={to} aria-current={pathname === to ? 'page' : undefined}>{label}</Link>)}</nav>
    <div className="policy-layout"><article className="policy-content">{page.sections.map(([title, content], index) => <section key={title}><span className="policy-number">{String(index + 1).padStart(2, '0')}</span><div><h2>{title}</h2><p>{content}</p></div></section>)}<div className="policy-next"><FileCheck2 size={20} /><p>Keep your order reference close. It helps us find the right details.</p><Link to="/track-order">Open order tracking <ArrowRight size={15} /></Link></div></article>
      <aside className="policy-contact"><span className="policy-kicker">A REAL PERSON, FOR THE DETAILS</span><h2>Talk to<br /><em>your studio.</em></h2><p>For an order question, privacy request or complaint, share your reference and the details with our customer support desk.</p><a href={getWhatsAppUrl(`Hello AL-NOOR, I need help with ${POLICY_LINKS.find(([, to]) => to === pathname)?.[0] || 'my order'}. My order reference: `)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> WhatsApp the studio <ArrowUpRight size={14} /></a><a href={`mailto:${BUSINESS_CONFIG.contact.email}`}><Mail size={16} />{BUSINESS_CONFIG.contact.email}</a><address>{BUSINESS_CONFIG.location.workshopAddress}</address><small>{BUSINESS_CONFIG.contact.phone}</small></aside></div>
  </div></div>;
}
