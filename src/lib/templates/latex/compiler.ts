import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import util from 'util';

const execAsync = util.promisify(exec);

export async function compileLaTeX(content: string): Promise<Buffer> {
  // Create a temporary directory
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'resume-'));
  const texFile = path.join(tempDir, 'resume.tex');
  const pdfFile = path.join(tempDir, 'resume.pdf');

  try {
    // Write LaTeX content to file
    fs.writeFileSync(texFile, content);

    // Run pdflatex twice to ensure proper compilation of references
    await execAsync(`pdflatex -interaction=nonstopmode -output-directory=${tempDir} ${texFile}`);
    await execAsync(`pdflatex -interaction=nonstopmode -output-directory=${tempDir} ${texFile}`);

    // Read the generated PDF
    const pdfContent = fs.readFileSync(pdfFile);

    return pdfContent;
  } catch (error) {
    console.error('Error compiling LaTeX:', error);
    throw new Error('Failed to compile LaTeX to PDF');
  } finally {
    // Clean up temporary directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Error cleaning up temporary directory:', error);
    }
  }
}

export async function generateResumePDF(content: string): Promise<{ buffer: Buffer; error?: string }> {
  try {
    const pdfBuffer = await compileLaTeX(content);
    return { buffer: pdfBuffer };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return {
      buffer: Buffer.from(''),
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
} 