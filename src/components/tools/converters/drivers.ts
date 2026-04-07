import { jsPDF } from "jspdf";
import JSZip from "jszip";
import html2canvas from "html2canvas";
import { Format } from "./types";

export const runPdfToImage = async (file: File, toFormat: Format) => {
    const pdfjsLib = await import("pdfjs-dist");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    const convertedImages: string[] = [];
    const mime = toFormat.mime || 'image/png';

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        if (context) {
            // @ts-ignore - Handle version-specific typing for pdfjs render
            await page.render({ canvasContext: context, viewport }).promise;
            convertedImages.push(canvas.toDataURL(mime));
        }
    }
    return { name: file.name.replace(/\.pdf$/i, ''), data: convertedImages };
};

export const runImageToPdf = async (files: File[]) => {
    const doc = new jsPDF();
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
        });
        
        if (i > 0) doc.addPage();
        const img = new Image();
        img.src = dataUrl;
        await new Promise(r => img.onload = r);
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const imgWidth = img.width;
        const imgHeight = img.height;
        const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
        
        doc.addImage(dataUrl, 'JPEG', 0, 0, imgWidth * ratio, imgHeight * ratio);
    }
    const pdfBlob = doc.output('blob');
    return { name: 'combined-conversion.pdf', url: URL.createObjectURL(pdfBlob) };
};

export const runImageToImage = async (
    files: File[], 
    fromFormat: Format, 
    toFormat: Format, 
    compressionQuality: number,
    setProgress: (progress: number) => void
) => {
    const convertedImages: any[] = [];
    const mimeMap: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        bmp: 'image/bmp',
        gif: 'image/gif'
    };
    const targetMime = mimeMap[toFormat.id] || 'image/png';

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
        });

        const img = new Image();
        img.src = dataUrl;
        await new Promise(r => img.onload = r);

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            if (targetMime === 'image/jpeg' || targetMime === 'image/bmp') {
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(img, 0, 0);
            
            const quality = toFormat.id === fromFormat.id || targetMime === 'image/jpeg' ? compressionQuality : 0.92;
            
            convertedImages.push({
                name: file.name.replace(new RegExp(`\\.${fromFormat.id}$`, 'i'), 
                    toFormat.id === fromFormat.id ? `_compressed.${toFormat.id}` : `.${toFormat.id}`),
                url: canvas.toDataURL(targetMime, quality)
            });
        }
        setProgress(Math.round(((i + 1) / files.length) * 100));
    }
    return convertedImages;
};

export const runHtmlToImage = async (file: File, toFormat: Format, compressionQuality: number) => {
    return new Promise<{ name: string; url: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const htmlContent = e.target?.result as string;
            
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.width = '1200px';
            iframe.style.height = '1200px';
            iframe.style.top = '-9999px';
            iframe.style.visibility = 'hidden';
            document.body.appendChild(iframe);
            
            iframe.onload = async () => {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (iframeDoc) {
                        const targetMime = toFormat.mime || 'image/png';
                        const canvas = await html2canvas(iframeDoc.body, {
                            useCORS: true,
                            allowTaint: true,
                            backgroundColor: '#ffffff'
                        });
                        
                        const dataUrl = canvas.toDataURL(targetMime, compressionQuality);
                        document.body.removeChild(iframe);
                        resolve({ 
                            name: file.name.replace(/\.html?$/i, `.${toFormat.id}`), 
                            url: dataUrl 
                        });
                    } else {
                        throw new Error("Could not access iframe document");
                    }
                } catch (err) {
                    document.body.removeChild(iframe);
                    reject(err);
                }
            };
            
            iframe.srcdoc = htmlContent;
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

export const runCompressPdf = async (file: File, compressionQuality: number, setProgress: (progress: number) => void) => {
    const pdfjsLib = await import("pdfjs-dist");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    const doc = new jsPDF();
    
    for (let i = 1; i <= numPages; i++) {
        if (i > 1) doc.addPage();
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 * compressionQuality });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        if (context) {
            // @ts-ignore - Handle version-specific typing for pdfjs render
            await page.render({ canvasContext: context, viewport }).promise;
            const dataUrl = canvas.toDataURL('image/jpeg', compressionQuality);
            
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            doc.addImage(dataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);
        }
        setProgress(Math.round((i / numPages) * 100));
    }
    const pdfBlob = doc.output('blob');
    return { name: file.name.replace(/\.pdf$/i, '_compressed.pdf'), url: URL.createObjectURL(pdfBlob) };
};

export const runCreateZip = async (files: File[], setProgress: (progress: number) => void) => {
    const zip = new JSZip();
    for (let i = 0; i < files.length; i++) {
        zip.file(files[i].name, files[i]);
        setProgress(Math.round(((i + 0.5) / files.length) * 100));
    }
    const blob = await zip.generateAsync({ type: "blob" }, (metadata) => {
         setProgress(Math.round(metadata.percent));
    });
    return { name: `Archive_${files.length}_files.zip`, url: URL.createObjectURL(blob) };
};
