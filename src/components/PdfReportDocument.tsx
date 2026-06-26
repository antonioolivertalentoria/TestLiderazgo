import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { ScoreReport } from "@/lib/scoring";

type PdfReportDocumentProps = {
  report: ScoreReport;
  logoUrl: string;
  generatedAt: string;
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    padding: 36,
    fontFamily: "Helvetica",
    fontSize: 12,
    color: "#0B1220",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 260,
    height: 80,
    objectFit: "contain",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: "#4B5563",
  },
  section: {
    marginBottom: 18,
    padding: 16,
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    backgroundColor: "#F8FAFC",
  },
  sectionTitle: {
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 8,
  },
  headline: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: "48%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  metricLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#6B7280",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 700,
    marginTop: 6,
  },
  listItem: {
    marginBottom: 6,
    color: "#374151",
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  barLabel: {
    width: 80,
    fontSize: 10,
    color: "#111827",
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    marginRight: 8,
  },
  barFill: {
    height: 8,
    backgroundColor: "#D30976",
    borderRadius: 6,
  },
  barValue: {
    width: 36,
    fontSize: 10,
    color: "#111827",
    textAlign: "right",
  },
  matchesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  matchCard: {
    width: "30%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  matchTitle: {
    fontWeight: 700,
    marginBottom: 4,
  },
});

export default function PdfReportDocument({
  report,
  logoUrl,
  generatedAt,
}: PdfReportDocumentProps) {
  const styleEntries = Object.entries(report.styles.percentages);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoUrl} style={styles.logo} />
          <View>
            <Text style={styles.title}>Reporte Liderazgo Situacional</Text>
            <Text style={styles.subtitle}>{generatedAt}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <Text style={styles.headline}>{report.narrative.headline}</Text>
          <Text style={styles.subtitle}>{report.narrative.summary}</Text>
          <View style={[styles.grid, { marginTop: 12 }]}>
            {[
              { label: "Efectividad", value: `${report.totals.effectiveness}%` },
              { label: "Nivel", value: report.effectivenessLabel },
              { label: "Puntaje", value: `${report.effectivenessScore} / 24` },
              {
                label: "Decisiones óptimas",
                value: `${report.totals.matches} / ${report.totals.answered}`,
              },
            ].map((metric) => (
              <View key={metric.label} style={styles.metricCard}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{metric.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribución de estilos</Text>
          {styleEntries.map(([style, value]) => (
            <View key={style} style={styles.barRow}>
              <Text style={styles.barLabel}>{style}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${value}%` }]} />
              </View>
              <Text style={styles.barValue}>{value}%</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { flexDirection: "row", gap: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Fortalezas</Text>
            {report.narrative.strengths.map((item) => (
              <Text key={item} style={styles.listItem}>
                • {item}
              </Text>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Oportunidades</Text>
            {report.narrative.opportunities.map((item) => (
              <Text key={item} style={styles.listItem}>
                • {item}
              </Text>
            ))}
          </View>
        </View>

      </Page>
    </Document>
  );
}
