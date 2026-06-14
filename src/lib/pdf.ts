import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

/** Convierte el HTML imprimible que devuelve el API en un PDF y abre el diálogo para compartir/guardar. */
export async function generateAndSharePdf(
  html: string,
  dialogTitle = 'Documento UNCP Conecta',
): Promise<string> {
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle,
      UTI: 'com.adobe.pdf',
    });
  }
  return uri;
}

/** Abre el diálogo nativo de impresión directamente con el HTML. */
export async function printHtml(html: string): Promise<void> {
  await Print.printAsync({ html });
}
