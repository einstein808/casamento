'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  UploadCloud, 
  Heart, 
  Sparkles, 
  Image as ImageIcon, 
  X, 
  CheckCircle2, 
  Download,
  AlertCircle
} from 'lucide-react';
import { GuestPhoto } from '@/lib/types';
import { WeddingService } from '@/lib/wedding-service';
import { compressImage, preloadAndCacheImages } from '@/lib/image-cache';

export function GuestGallery() {
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const [uploaderName, setUploaderName] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<GuestPhoto | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPhotos = () => {
    const list = WeddingService.getPhotos();
    setPhotos(list);
    // Cache photos in background
    preloadAndCacheImages(list.map(p => p.photoUrl));
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor, selecione um arquivo de imagem válido (JPG, PNG, HEIC).');
      return;
    }

    try {
      // Compress image client-side to keep the site light and super fast
      const compressed = await compressImage(file);
      setRawFile(compressed);

      const reader = new FileReader();
      reader.onload = () => {
        setSelectedFilePreview(reader.result as string);
        setErrorMessage('');
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      setRawFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedFilePreview(reader.result as string);
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFilePreview || !uploaderName.trim()) {
      setErrorMessage('Por favor, adicione uma foto e o seu nome.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      let finalPhotoUrl = selectedFilePreview;

      // Upload to MinIO API if rawFile exists
      if (rawFile) {
        const formData = new FormData();
        formData.append('file', rawFile);
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            finalPhotoUrl = data.url;
          }
        }
      }

      WeddingService.addPhoto(uploaderName.trim(), finalPhotoUrl, caption.trim());
      setIsUploading(false);
      setUploadSuccess(true);
      setSelectedFilePreview(null);
      setRawFile(null);
      setCaption('');
      loadPhotos();

      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err) {
      console.error('Upload error:', err);
      // Fallback
      WeddingService.addPhoto(uploaderName.trim(), selectedFilePreview, caption.trim());
      setIsUploading(false);
      setUploadSuccess(true);
      setSelectedFilePreview(null);
      setRawFile(null);
      setCaption('');
      loadPhotos();
    }
  };

  const handleLike = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    WeddingService.toggleLikePhoto(photoId);
    loadPhotos();
  };

  return (
    <section id="fotos" className="py-10 sm:py-24 bg-[#F7F2EE] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Motion */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-3 mb-8 sm:mb-14"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#C2847A] text-xs font-semibold tracking-wider uppercase shadow-xs">
            <Camera className="w-3.5 h-3.5" />
            Mural dos Convidados
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#2D2422]">
            Fotos do Grande Dia
          </h2>
          <p className="text-sm sm:text-base text-[#8D7B75] max-w-xl mx-auto font-light">
            Tirou fotos lindas na nossa cerimônia ou na festa? Suba aqui para eternizarmos esse momento pelo seu olhar!
          </p>
          <div className="w-24 h-0.5 bg-[#C2847A]/40 mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Upload Box */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mx-auto mb-8 sm:mb-16 bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-[#EADBCE]"
        >
          <form onSubmit={handleUpload} className="space-y-5">
            <div className="text-center space-y-1">
              <h3 className="font-serif text-xl font-medium text-[#2D2422]">
                Compartilhe sua Foto com os Noivos
              </h3>
              <p className="text-xs text-[#8D7B75]">
                Upload otimizado direto para a nuvem dos noivos (MinIO)
              </p>
            </div>

            {/* File Dropzone */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-colors ${
                selectedFilePreview
                  ? 'border-[#C2847A] bg-[#FAF3EE]'
                  : 'border-[#E8DCD5] hover:border-[#C2847A] bg-[#FDFBF7]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {selectedFilePreview ? (
                <div className="space-y-3">
                  <img
                    src={selectedFilePreview}
                    alt="Preview"
                    className="max-h-56 mx-auto rounded-xl object-contain shadow-sm"
                  />
                  <p className="text-xs text-[#C2847A] font-semibold">
                    Foto pronta e comprimida! Clique para trocar
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#FAF3EE] text-[#C2847A] flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2D2422]">
                      Clique para escolher a foto
                    </p>
                    <p className="text-xs text-[#8D7B75]">Compressão automática inteligente</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Uploader name and caption */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wider text-[#8D7B75] font-semibold">
                  Seu Nome: <span className="text-[#C2847A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  placeholder="Ex: Mariana Oliveira"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] text-xs sm:text-sm focus:outline-none focus:border-[#C2847A]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wider text-[#8D7B75] font-semibold">
                  Legenda / Recadinho (Opcional):
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ex: Que momento lindo!"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#E8DCD5] text-xs sm:text-sm focus:outline-none focus:border-[#C2847A]"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Foto publicada com sucesso no mural dos noivos!</span>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isUploading || !selectedFilePreview}
              className="w-full py-3.5 rounded-2xl bg-[#C2847A] text-white font-medium text-sm hover:bg-[#B07065] shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>{isUploading ? 'Enviando foto para a nuvem...' : 'Publicar Foto no Mural'}</span>
            </motion.button>
          </form>
        </motion.div>

        {/* Photos Grid - Uniform Card Dimensions */}
        {photos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#F0E6DF] max-w-xl mx-auto space-y-2">
            <ImageIcon className="w-8 h-8 text-[#8D7B75] mx-auto" />
            <h4 className="font-medium text-[#2D2422]">Nenhuma foto no mural ainda</h4>
            <p className="text-xs text-[#8D7B75]">
              Seja o primeiro a enviar uma foto do casamento para inaugurar o álbum!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
            {photos.map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                onClick={() => setLightboxPhoto(photo)}
                className="group relative bg-white rounded-3xl overflow-hidden border border-[#F0E6DF] shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Standardized Square / Aspect Ratio Image Container */}
                <div className="relative w-full aspect-square sm:aspect-[4/5] overflow-hidden bg-gray-100">
                  <img
                    src={photo.photoUrl}
                    alt={photo.caption || `Foto por ${photo.uploaderName}`}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Harmonized Card Content */}
                <div className="p-4 bg-white flex flex-col justify-between flex-1 space-y-2 border-t border-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2D2422] truncate">
                      {photo.uploaderName}
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleLike(photo.id, e)}
                      className="flex items-center gap-1 text-xs text-[#C2847A] shrink-0"
                    >
                      <Heart className="w-3.5 h-3.5 fill-[#C2847A]" />
                      <span>{photo.likes}</span>
                    </motion.button>
                  </div>

                  <p className="text-xs text-[#6B5A55] line-clamp-2 italic min-h-[1.25rem]">
                    {photo.caption ? `“${photo.caption}”` : ''}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal with AnimatePresence */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <button
                onClick={() => setLightboxPhoto(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-hidden bg-black flex items-center justify-center max-h-[70vh]">
                <img
                  src={lightboxPhoto.photoUrl}
                  alt="Foto em tela cheia"
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>

              <div className="p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-medium text-[#2D2422] text-sm sm:text-base">
                    Foto enviada por: <span className="text-[#C2847A]">{lightboxPhoto.uploaderName}</span>
                  </h4>
                  {lightboxPhoto.caption && (
                    <p className="text-xs sm:text-sm text-[#6B5A55] mt-1 italic">
                      &ldquo;{lightboxPhoto.caption}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleLike(lightboxPhoto.id, e)}
                    className="px-4 py-2 rounded-full bg-[#FAF3EE] text-[#C2847A] text-xs font-semibold hover:bg-[#C2847A] hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                    <span>{lightboxPhoto.likes} Curtidas</span>
                  </motion.button>

                  <a
                    href={lightboxPhoto.photoUrl}
                    download={`casamento-${lightboxPhoto.uploaderName}.jpg`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    title="Baixar Foto"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
