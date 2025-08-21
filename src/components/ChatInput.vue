<template>
  <div class="chat-input-container">
    <v-form @submit.prevent="handleSubmit">
      <div class="input-wrapper">
        <!-- Category Selection Dropdown -->
        <!-- <div class="category-selector">
          <v-select
            v-model="selectedCategory"
            :items="availableCategories"
            item-title="label"
            item-value="value"
            placeholder="Select Category"
            variant="plain"
            density="compact"
            hide-details
            class="category-select"
          >
            <template #selection="{ item }">
              <div v-if="item.raw" class="category-chip">
                <v-icon size="14" class="me-1">{{ item.raw.icon }}</v-icon>
                {{ item.raw.label }}
              </div>
              <div v-else class="category-chip category-chip-placeholder">
                <v-icon size="14" class="me-1">mdi-tag-outline</v-icon>
                Category
              </div>
            </template>
            <template #item="{ item, props: itemProps }">
              <v-list-item v-bind="itemProps" class="category-item">
                <template #prepend>
                  <v-icon size="16">{{ item.raw.icon }}</v-icon>
                </template>
                <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-select>
        </div>

        <v-divider vertical class="category-divider" /> -->

        <v-textarea
          v-model="inputMessage"
          auto-grow
          class="flex-grow-1 chat-textarea"
          hide-details
          max-rows="3"
          :placeholder="placeholderText"
          rows="1"
          variant="outlined"
          density="compact"
          :disabled="!selectedCategory"
          @keydown.enter.exact.prevent="handleSubmit"
          @keydown.enter.shift.exact="addNewLine"
        />

        <div class="input-actions">
          <!-- <v-btn icon size="small" variant="text" color="grey" class="voice-btn" @click="handleVoiceInput">
            <v-icon>mdi-microphone</v-icon>
            <v-tooltip activator="parent" location="top">Voice Input</v-tooltip>
          </v-btn> -->

          <v-btn
            color="primary"
            icon
            size="small"
            variant="flat"
            class="send-btn"
            :disabled="!canSend"
            :loading="isLoading"
            @click="handleSubmit"
          >
            <v-icon>mdi-send</v-icon>
            <v-tooltip activator="parent" location="top">Send Message</v-tooltip>
          </v-btn>
        </div>
      </div>
    </v-form>

    <!-- Footer with disclaimer and branding -->
    <!-- <div class="chat-footer">
      <div class="disclaimer-text">
        Informasi yang diberikan oleh AIVA dihasilkan oleh AI dan belum tentu akurat. Silakan lakukan pengecekan ulang
        dengan sumber terkait.
      </div>
    </div> -->
    <div class="powered-by">Powered by <strong>PERURI</strong></div>
    <div v-if="error" class="text-error text-caption mt-2">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import type { Authority } from '../types/chat';

  interface Props {
    isLoading?: boolean;
    error?: string | null;
    userAuthority?: Authority | null;
  }

  interface Emits {
    'send-message': [message: string, category?: string];
    'voice-input': [];
  }

  interface CategoryOption {
    value: string;
    label: string;
    description: string;
    icon: string;
    suggestions?: string[];
  }

  const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
    error: null,
    userAuthority: null,
  });

  const emit = defineEmits<Emits>();

  const inputMessage = ref('');
  const selectedCategory = ref<string>('');

  // Define categories based on user authority
  const getCategoriesByAuthority = (authority: Authority | null): CategoryOption[] => {
    const allCategorySuggestions = [''];

    const codeOfConductSuggestions = [
      'Bagaimana Peruri mengelola risiko benturan kepentingan dalam pengambilan keputusan strategis dan pengadaan barang/jasa?',
      'Apa saja tanggung jawab pemimpin Peruri dalam membangun budaya kepatuhan terhadap Pedoman Etika Perilaku, dan bagaimana pelaksanaannya diukur?',
      'Bagaimana pendekatan Peruri terhadap pelestarian lingkungan diintegrasikan dalam kebijakan operasional dan pengembangan jangka panjang perusahaan?',
      'Dalam konteks hubungan dengan stakeholders, bagaimana Peruri memastikan prinsip fairness, transparansi, dan akuntabilitas diterapkan secara menyeluruh?',
      'Apa strategi Peruri dalam menerapkan sistem Whistle Blowing agar tetap efektif, melindungi pelapor, dan menjaga integritas internal?',
    ];

    const corporateGovernanceSuggestions = [
      'Apa tujuan utama penerapan prinsip-prinsip Good Corporate Governance (GCG) di PERURI?',
      'Bagaimana prinsip transparansi diterapkan di PERURI?',
      'Apa saja kriteria yang harus dipenuhi untuk menjadi anggota Direksi PERURI?',
      'Jelaskan peran Dewan Pengawas dalam tata kelola PERURI.',
      'Bagaimana sistem pengendalian internal diterapkan di PERURI?',
    ];

    const dataPerlindunganSuggestions = [
      'Apa latar belakang disusunnya kebijakan Pelindungan Data Pribadi (PDP) di PERURI?',
      'Bagaimana strategi pelindungan data pribadi diimplementasikan di lingkungan PERURI?',
      'Siapa saja pihak-pihak yang termasuk dalam pengelolaan dan pemrosesan data pribadi di PERURI?',
      'Apa saja prinsip utama dalam pemrosesan data pribadi menurut kebijakan ini?',
      'Apa peran dan tanggung jawab Data Protection Officer (DPO) di PERURI?',
    ];

    const itGovernanceSuggestions = [
      'Apa peran strategis IT Governance dalam mendukung prinsip Good Corporate Governance (GCG) di Peruri?',
      'Bagaimana komitmen manajemen Peruri tercermin dalam kebijakan sistem manajemen tata kelola TI?',
      'Mengapa prinsip segregasi tugas penting dalam struktur tata kelola TI Peruri?',
      'Apa saja elemen penting dalam penyusunan Master Plan TI di Peruri?',
      'Bagaimana Peruri menjamin keamanan informasi dalam implementasi teknologi informasi?',
    ];

    const financialPolicySuggestions = [
      'Apa latar belakang disusunnya Financial Policy Manual dalam pengelolaan keuangan perusahaan?',
      'Apa pendekatan yang digunakan dalam penyusunan Manual Kebijakan Keuangan ini?',
      'Sebutkan prinsip-prinsip yang mendasari pengelolaan keuangan!',
      'Bagaimana proses penyusunan RKAP dalam perusahaan?',
      'Apa yang dimaksud dengan Zero Based Budgeting dalam konteks anggaran perusahaan?',
    ];

    const tjslSuggestions = [
      'Apa yang dimaksud dengan Program TJSL BUMN?',
      'Bagaimana definisi Badan Usaha Milik Negara?',
      'Apa saja prinsip yang harus diterapkan dalam pelaksanaan Program TJSL?',
      'Apa tujuan strategis dari Program TJSL sebagaimana dijelaskan dalam dokumen ini?',
      'Siapakah yang termasuk dalam kategori Mitra Binaan dalam Program Pendanaan UMK?',
    ];

    const mspSuggestions = [
      'Apa tujuan utama dari disusunnya dokumen Manual Marketing, Sales & Product ini?',
      'Apa saja ruang lingkup yang diatur dalam buku panduan ini?',
      'Bagaimana definisi dari pemasaran dalam konteks manual ini?',
      'Apa perbedaan mendasar antara pemasaran dan penjualan menurut dokumen ini?',
      "Bagaimana peran 'market intelligence' dalam pengambilan keputusan strategis pemasaran?",
    ];

    const riskManagementSuggestions = [
      'Apa itu Taksonomi Risiko?',
      'Apa yang dimaksud dengan Pemilik Risiko/Risk Owner?',
      'Bagaimana cara menerapkan manajemen risiko yang efektif?',
      'Bagaimana kebijakan BCMS (Business Continuity Management System) di Peruri?',
      'Bagaimana cara atau pertimbangan dalam menetapkan konteks risiko?',
    ];

    const accountingSuggestions = [
      'Bagaimana prosedur pengalihan anggaran?',
      'Bagaimana prosedur atau mekanisme revisi anggaran Perusahaan?',
      'Bagaimana proses untuk Realisasi Perencaan Produksi?',
      'Bagaimana ketentuan atau metode Pengadaan Langsung?',
      'Bagaimana alur penerimaan produk retur?',
    ];

    switch (authority) {
      case 'HUKUM':
        return [
          {
            value: 'all',
            label: 'All',
            description: 'Search across all categories',
            icon: 'mdi-view-grid',
            suggestions: allCategorySuggestions,
          },
          {
            value: 'code-of-conduct',
            label: 'Code of Conduct',
            description: 'Pedoman etika perilaku dan standar',
            icon: 'mdi-gavel',
            suggestions: codeOfConductSuggestions,
          },
          {
            value: 'code-of-corporate-governance',
            label: 'Code of Corporate Governance',
            description: 'Prinsip tata kelola perusahaan yang baik',
            icon: 'mdi-shield-check',
            suggestions: corporateGovernanceSuggestions,
          },
          {
            value: 'perlindungan-data-pribadi',
            label: 'Perlindungan Data Pribadi',
            description: 'Kebijakan pelindungan data pribadi',
            icon: 'mdi-shield-account',
            suggestions: dataPerlindunganSuggestions,
          },
          {
            value: 'risk-management-compliance',
            label: 'Risk Management and Compliance',
            description: 'Manajemen risiko dan kepatuhan',
            icon: 'mdi-security',
            suggestions: riskManagementSuggestions,
          },
        ];
      case 'SDM':
        return [
          {
            value: 'all',
            label: 'All',
            description: 'Search across all categories',
            icon: 'mdi-view-grid',
            suggestions: allCategorySuggestions,
          },
          {
            value: 'manual-tjsl',
            label: 'Manual TJSL',
            description: 'Tanggung Jawab Sosial dan Lingkungan',
            icon: 'mdi-hand-heart',
            suggestions: tjslSuggestions,
          },
          {
            value: 'manual-msp',
            label: 'Manual MSP',
            description: 'Marketing, Sales & Product manual',
            icon: 'mdi-chart-line',
            suggestions: mspSuggestions,
          },
        ];
      case 'ADMIN':
        return [
          {
            value: 'all',
            label: 'All',
            description: 'Search across all categories',
            icon: 'mdi-view-grid',
            suggestions: allCategorySuggestions,
          },
          {
            value: 'it-corporate-governance',
            label: 'IT Corporate Governance',
            description: 'Tata kelola teknologi informasi',
            icon: 'mdi-server-security',
            suggestions: itGovernanceSuggestions,
          },
          {
            value: 'financial-policy-manual',
            label: 'Financial Policy Manual',
            description: 'Manual kebijakan keuangan',
            icon: 'mdi-currency-usd',
            suggestions: financialPolicySuggestions,
          },
          {
            value: 'accounting-procedure',
            label: 'Accounting and Procedure',
            description: 'Prosedur akuntansi dan keuangan',
            icon: 'mdi-calculator',
            suggestions: accountingSuggestions,
          },
        ];
      case 'ALL':
        return [
          {
            value: 'all',
            label: 'All',
            description: 'Search across all categories',
            icon: 'mdi-view-grid',
            suggestions: allCategorySuggestions,
          },
          {
            value: 'code-of-conduct',
            label: 'Code of Conduct',
            description: 'Pedoman etika perilaku dan standar',
            icon: 'mdi-gavel',
            suggestions: codeOfConductSuggestions,
          },
          {
            value: 'code-of-corporate-governance',
            label: 'Code of Corporate Governance',
            description: 'Prinsip tata kelola perusahaan yang baik',
            icon: 'mdi-shield-check',
            suggestions: corporateGovernanceSuggestions,
          },
          {
            value: 'perlindungan-data-pribadi',
            label: 'Perlindungan Data Pribadi',
            description: 'Kebijakan pelindungan data pribadi',
            icon: 'mdi-shield-account',
            suggestions: dataPerlindunganSuggestions,
          },
          {
            value: 'it-corporate-governance',
            label: 'IT Corporate Governance',
            description: 'Tata kelola teknologi informasi',
            icon: 'mdi-server-security',
            suggestions: itGovernanceSuggestions,
          },
          {
            value: 'financial-policy-manual',
            label: 'Financial Policy Manual',
            description: 'Manual kebijakan keuangan',
            icon: 'mdi-currency-usd',
            suggestions: financialPolicySuggestions,
          },
          {
            value: 'manual-tjsl',
            label: 'Manual TJSL',
            description: 'Tanggung Jawab Sosial dan Lingkungan',
            icon: 'mdi-hand-heart',
            suggestions: tjslSuggestions,
          },
          {
            value: 'manual-msp',
            label: 'Manual MSP',
            description: 'Marketing, Sales & Product manual',
            icon: 'mdi-chart-line',
            suggestions: mspSuggestions,
          },
          {
            value: 'risk-management-compliance',
            label: 'Risk Management and Compliance',
            description: 'Manajemen risiko dan kepatuhan',
            icon: 'mdi-security',
            suggestions: riskManagementSuggestions,
          },
          {
            value: 'accounting-procedure',
            label: 'Accounting and Procedure',
            description: 'Prosedur akuntansi dan keuangan',
            icon: 'mdi-calculator',
            suggestions: accountingSuggestions,
          },
        ];
      default:
        return [
          {
            value: 'all',
            label: 'All',
            description: 'Search across all categories',
            icon: 'mdi-view-grid',
            suggestions: allCategorySuggestions,
          },
          {
            value: 'general',
            label: 'General',
            description: 'General inquiries',
            icon: 'mdi-help-circle',
            suggestions: [
              'Apa informasi umum tentang Peruri?',
              'Bagaimana cara menghubungi customer service?',
              'Apa jam operasional Peruri?',
            ],
          },
        ];
    }
  };

  const availableCategories = computed(() => getCategoriesByAuthority(props.userAuthority));

  // Auto-select first category when categories change
  watch(
    availableCategories,
    (newCategories, oldCategories) => {
      // Clear the selected category when categories change (authority change)
      if (oldCategories && newCategories !== oldCategories) {
        selectedCategory.value = '';
      }

      // Auto-select first category if available and none is selected
      if (newCategories.length > 0 && !selectedCategory.value) {
        selectedCategory.value = newCategories[0].value;
      }
    },
    { immediate: true } // Run immediately on component mount
  );

  const placeholderText = computed(() => {
    // if (!selectedCategory.value) {
    //   return 'Please select the category';
    // }
    // const categoryLabel = availableCategories.value.find(cat => cat.value === selectedCategory.value)?.label || 'Aiva';
    return `Ask anything ...`;
  });

  const canSend = computed(() => {
    return inputMessage.value.trim().length > 0 && !props.isLoading && selectedCategory.value;
  });

  const handleSubmit = () => {
    if (!canSend.value) return;

    const message = inputMessage.value.trim();
    if (message) {
      const categoryToSend = selectedCategory.value === 'all' ? '' : selectedCategory.value;
      emit('send-message', message, categoryToSend);
      inputMessage.value = '';
    }
  };

  const addNewLine = () => {
    inputMessage.value += '\n';
  };

  const handleVoiceInput = () => {
    emit('voice-input');
  };
</script>

<style scoped>
  .chat-input-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 16px;
    background-color: #f5f5f5 !important;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: white;
    border-radius: 20px;
    border: 1px solid #e0e0e0;
    padding: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    min-height: 48px;
    gap: 0;
  }

  .input-wrapper:focus-within {
    border-color: #202887;
    box-shadow: 0 2px 12px rgba(32, 40, 135, 0.15);
  }

  /* Category Selector Styles */
  .category-selector {
    min-width: 120px;
    max-width: 160px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
  }

  .category-select :deep(.v-field) {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
    min-height: auto !important;
    padding: 0 !important;
  }

  .category-select :deep(.v-field__input) {
    padding: 0 !important;
    min-height: auto !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    color: #202887 !important;
    display: flex !important;
    align-items: center !important;
  }

  .category-select :deep(.v-field__append-inner) {
    padding: 0 !important;
    margin-left: 4px !important;
    align-items: center !important;
  }

  .category-select :deep(.v-icon) {
    font-size: 16px !important;
    color: #666 !important;
  }

  /* Placeholder styling for category select */
  .category-select :deep(.v-field__input input::placeholder) {
    color: #999 !important;
    opacity: 1 !important;
    font-size: 13px !important;
    font-weight: 400 !important;
  }

  .category-select :deep(.v-field__input .v-field__placeholder) {
    color: #999 !important;
    opacity: 1 !important;
    font-size: 13px !important;
    font-weight: 400 !important;
  }

  .category-chip {
    display: flex;
    align-items: center;
    font-size: 13px;
    font-weight: 500;
    color: #202887;
    line-height: 1;
  }

  .category-chip-placeholder {
    color: #999 !important;
    font-weight: 400 !important;
  }

  .category-chip-placeholder .v-icon {
    color: #999 !important;
  }

  .category-divider {
    height: 32px;
    margin: 0 8px;
    opacity: 0.3;
    align-self: center;
  }

  /* Category dropdown items */
  :deep(.category-item) {
    min-height: 56px !important;
  }

  :deep(.category-item .v-list-item-title) {
    font-weight: 500 !important;
    color: #1a1a1a !important;
  }

  :deep(.category-item .v-list-item-subtitle) {
    font-size: 12px !important;
    color: #666 !important;
  }

  :deep(.category-item:hover) {
    background-color: rgba(32, 40, 135, 0.05) !important;
  }

  .chat-textarea :deep(.v-field) {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
  }

  .chat-textarea :deep(.v-field__outline) {
    display: none !important;
  }

  .chat-textarea :deep(.v-field__input) {
    padding: 12px 16px !important;
    min-height: 20px !important;
    font-size: 14px;
    font-family: 'Manrope', sans-serif;
    display: flex;
    align-items: center;
  }

  .input-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
  }

  .voice-btn {
    color: #666 !important;
  }

  .voice-btn:hover {
    background-color: rgba(0, 0, 0, 0.04) !important;
  }

  .send-btn {
    background-color: #202887 !important;
    color: white !important;
    border-radius: 50% !important;
    min-width: 32px !important;
    width: 32px !important;
    height: 32px !important;
  }

  .send-btn:disabled {
    background-color: #e0e0e0 !important;
    color: #999 !important;
  }

  .send-btn:hover:not(:disabled) {
    background-color: #1a1f6b !important;
    transform: scale(1.05);
    transition: all 0.2s ease;
  }

  .chat-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin-top: 12px;
    font-family: 'Manrope', sans-serif;
  }

  .disclaimer-text {
    font-size: 12px;
    color: #666;
    text-align: center;
  }

  .powered-by {
    font-size: 11px;
    color: #888;
    text-align: center;
  }

  .powered-by strong {
    color: #202887;
    font-weight: 600;
  }

  /* Responsive adjustments */
  @media (max-width: 600px) {
    .chat-input-container {
      padding: 12px;
    }

    .input-wrapper {
      border-radius: 18px;
      min-height: 44px;
      padding: 2px;
    }

    .category-selector {
      min-width: 100px;
      max-width: 140px;
      padding: 6px 8px;
    }

    .category-divider {
      height: 28px;
      margin: 0 6px;
    }

    .chat-textarea :deep(.v-field__input) {
      padding: 10px 14px !important;
      font-size: 13px;
    }
  }
</style>
