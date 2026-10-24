export const makeMember=()=>({name:'',age:'',relation:''});
export const makeLtcJourney=()=>({date:'',from:'',to:'',distance:'',mode:'',classUsed:'',fares:'1',amount:'',remarks:''});
export const makeHigher=()=>({from:'',to:'',mode:'',entitled:'',travelled:'',fares:'',amount:''});
export const makeRoad=()=>({from:'',to:'',entitled:'',fare:''});
export const makeMedical=()=>({name:'',designation:'',employeeId:'',amount:'',dependent:'',relation:'',spouseGov:'No',status:'Under Process'});
export const makeTaJourney=()=>({from:'',departureDate:'',departureTime:'',to:'',arrivalDate:'',arrivalTime:'',mode:'By Road',travelClass:'',fareCount:'',fareAmount:'',km:'',kmRate:'',daDate:'',daDays:'',daRate:'',daAmount:'',expenseName:'',expenseAmount:'',remarks:''});
export const defaults={
 ltc:{name:'',designation:'',pay:'',headquarters:'EMRS Karanjiya, Dindori (M.P.)',leaveNature:'Earned Leave',leaveFrom:'',leaveTo:'',members:[makeMember()],journeys:[makeLtcJourney()],advance:'',higherSanction:'',higher:[makeHigher()],road:[makeRoad()],blockFrom:'',blockTo:'',spouseEmployer:'',declarationDate:'',admissible:'',officeAdvance:'',officeRemarks:''},
 medical:{rows:[makeMedical()]},
 ta:{school:'EMRS KARANJIYA DINDORI MADHYA PRADESH 481884',name:'',designation:'',headquarters:'EMRS Karanjiya, Dindori (M.P.)',purpose:'',payLevel:'',billMonth:'',rows:[makeTaJourney()],advance:'',serviceDate:'',homeTown:'',shortestRoute:'',leavePeriod:'',familyDetails:'',priorNotice:'',advanceWords:'',withdrawalDate:'',claimFor:'Self',passedAmount:'',signatureDate:'',employeeAdvanceDate:'',controllingDate:''}
};
export const info={
 ltc:{title:'LTC Claim Form',subtitle:'Leave Travel Concession',description:'Employee, family, journey and concession declarations.'},
 medical:{title:'Medical Reimbursement',subtitle:'Medical claim statement',description:'Employee and dependent claim register, as supplied in your PDF.'},
 ta:{title:'TA & DA Claim Form',subtitle:'Travelling and Daily Allowance',description:'Journey, fares, road mileage, allowance and certifications.'}
};
export const sum=(items,f)=>items.reduce((s,r)=>s+(Number(f(r))||0),0);
export const taRowAmount=r=>Number(r.fareAmount||0)+(Number(r.km||0)*Number(r.kmRate||0))+(String(r.daAmount??'').trim()!==''?Number(r.daAmount||0):Number(r.daDays||0)*Number(r.daRate||0))+Number(r.expenseAmount||0);
export const inr=n=>'₹'+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:2});
export const dateText=d=>!d?'':/^\d{4}-\d{2}-\d{2}$/.test(d)?d.slice(8)+'/'+d.slice(5,7)+'/'+d.slice(0,4):d;
