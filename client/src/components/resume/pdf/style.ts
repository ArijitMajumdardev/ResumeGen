import { StyleSheet } from '@react-pdf/renderer';


// Define styles
export const styles = StyleSheet.create({

  page: { padding: 20 },
  section: { marginBottom: 10 },
  header: { textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  subHeader: { textAlign: 'center', fontSize: 12, marginBottom: 5 },
  text: { fontSize: 10 },
  divider: { borderBottom: 1, marginVertical: 5 ,borderColor:'gray' },
    experienceContainer: { marginBottom: 10 },
  

    //skills
  skillBar: { height: 5, backgroundColor: '#ddd', width: '100%', position: 'relative' },
    skillFill: { height: 5, position: 'absolute', top: 0, left: 0 },
    skillList: {
        flexWrap:'wrap'
    }
});
